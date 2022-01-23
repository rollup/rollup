const assert = require('assert');
const acorn = require('acorn');
const rollup = require('../../dist/rollup');
const { executeBundle } = require('../utils.js');

describe('incremental', () => {
	let resolveIdCalls;
	let transformCalls;
	let modules;

	const plugin = {
		resolveId: id => {
			resolveIdCalls++;
			return id === 'external' ? false : id;
		},

		load: id => {
			return modules[id];
		},

		transform: code => {
			transformCalls++;
			return code;
		}
	};

	beforeEach(() => {
		resolveIdCalls = 0;
		transformCalls = 0;

		modules = {
			entry: `import foo from 'foo'; export default foo;`,
			foo: `export default 42`,
			bar: `export default 21`
		};
	});

	it('does not resolve ids and transforms in the second time', async () => {
		const firstBundle = await rollup.rollup({
			input: 'entry',
			plugins: [plugin]
		});
		assert.strictEqual(resolveIdCalls, 2);
		assert.strictEqual(transformCalls, 2);

		const secondBundle = await rollup.rollup({
			input: 'entry',
			plugins: [plugin],
			cache: firstBundle
		});
		assert.strictEqual(resolveIdCalls, 3); // +1 for entry point which is resolved every time
		assert.strictEqual(transformCalls, 2);

		const result = await executeBundle(secondBundle);
		assert.strictEqual(result, 42);
	});

	it('does not resolve dynamic ids and transforms in the second time', () => {
		modules = {
			entry: `export default import('foo');`,
			foo: `export default 42`
		};
		return rollup
			.rollup({
				input: 'entry',
				plugins: [plugin]
			})
			.then(bundle => {
				assert.strictEqual(resolveIdCalls, 2);
				assert.strictEqual(transformCalls, 2);
				return rollup.rollup({
					input: 'entry',
					plugins: [plugin],
					cache: bundle
				});
			})
			.then(bundle => {
				assert.strictEqual(resolveIdCalls, 3); // +1 for entry point which is resolved every time
				assert.strictEqual(transformCalls, 2);
			});
	});

	it('transforms modified sources', () => {
		let cache;

		return rollup
			.rollup({
				input: 'entry',
				plugins: [plugin]
			})
			.then(bundle => {
				assert.strictEqual(transformCalls, 2);

				return executeBundle(bundle).then(result => {
					assert.strictEqual(result, 42);

					modules.foo = `export default 43`;
					cache = bundle.cache;
				});
			})
			.then(() => {
				return rollup.rollup({
					input: 'entry',
					plugins: [plugin],
					cache
				});
			})
			.then(bundle => {
				assert.strictEqual(transformCalls, 3);

				return executeBundle(bundle);
			})
			.then(result => {
				assert.strictEqual(result, 43);
			});
	});

	it('resolves id of new imports', () => {
		let cache;

		return rollup
			.rollup({
				input: 'entry',
				plugins: [plugin]
			})
			.then(bundle => {
				assert.strictEqual(resolveIdCalls, 2);

				return executeBundle(bundle).then(result => {
					assert.strictEqual(result, 42);

					modules.entry = `import bar from 'bar'; export default bar;`;
					cache = bundle.cache;
				});
			})
			.then(() => {
				return rollup.rollup({
					input: 'entry',
					plugins: [plugin],
					cache
				});
			})
			.then(bundle => {
				assert.strictEqual(resolveIdCalls, 4);

				return executeBundle(bundle);
			})
			.then(result => {
				assert.strictEqual(result, 21);
			});
	});

	it('respects externals from resolveId', () => {
		let cache;
		modules.foo = `import p from 'external'; export default p;`;

		const require = id => id === 'external' && 43;

		return rollup
			.rollup({
				input: 'entry',
				plugins: [plugin]
			})
			.then(bundle => {
				assert.strictEqual(resolveIdCalls, 3);

				return executeBundle(bundle, require).then(result => {
					assert.strictEqual(result, 43);
					cache = bundle.cache;
				});
			})
			.then(() => {
				return rollup.rollup({
					input: 'entry',
					plugins: [plugin],
					cache
				});
			})
			.then(bundle => {
				assert.strictEqual(resolveIdCalls, 4);

				return executeBundle(bundle, require);
			})
			.then(result => {
				assert.strictEqual(result, 43);
			});
	});

	it('keeps ASTs between runs', () => {
		return rollup
			.rollup({
				input: 'entry',
				plugins: [plugin]
			})
			.then(bundle => {
				const asts = {};
				bundle.cache.modules.forEach(module => {
					asts[module.id] = module.ast;
				});

				assert.deepEqual(
					asts.entry,
					acorn.parse(modules.entry, { sourceType: 'module', ecmaVersion: 2020 })
				);
				assert.deepEqual(
					asts.foo,
					acorn.parse(modules.foo, { sourceType: 'module', ecmaVersion: 2020 })
				);
			});
	});

	it('recovers from errors', () => {
		modules.entry = `import foo from 'foo'; import bar from 'bar'; export default foo + bar;`;

		return rollup
			.rollup({
				input: 'entry',
				plugins: [plugin]
			})
			.then(cache => {
				modules.foo = `var 42 = nope;`;

				return rollup
					.rollup({
						input: 'entry',
						plugins: [plugin],
						cache
					})
					.catch(err => {
						return cache;
					});
			})
			.then(cache => {
				modules.foo = `export default 42;`;

				return rollup
					.rollup({
						input: 'entry',
						plugins: [plugin],
						cache
					})
					.then(bundle => {
						return executeBundle(bundle);
					})
					.then(result => {
						assert.strictEqual(result, 63);
					});
			});
	});

	it('combines resolvedIds from resolvedExternalIds', () => {
		modules = {
			entry: `import foo from 'foo'; import external from 'external'; console.log(foo(external));`,
			foo: `export default 42`
		};

		return rollup
			.rollup({
				input: 'entry',
				external: ['external'],
				plugins: [plugin]
			})
			.then(bundle => {
				assert.strictEqual(bundle.cache.modules[0].id, 'foo');
				assert.strictEqual(bundle.cache.modules[1].id, 'entry');

				assert.deepEqual(bundle.cache.modules[1].resolvedIds, {
					foo: {
						id: 'foo',
						external: false,
						meta: {},
						moduleSideEffects: true,
						syntheticNamedExports: false
					},
					external: {
						id: 'external',
						external: true,
						meta: {},
						moduleSideEffects: true,
						syntheticNamedExports: false
					}
				});
			});
	});

	it('restores module options from cache', async () => {
		let moduleParsedCalls = 0;
		const plugin = {
			name: 'test',
			resolveId(id) {
				resolveIdCalls++;
				return { id, meta: { test: { resolved: id } } };
			},

			load(id) {
				return { code: modules[id], meta: { test: { loaded: id } } };
			},

			transform(code, id) {
				transformCalls++;
				assert.deepStrictEqual(this.getModuleInfo(id).meta, { test: { loaded: id } }, 'transform');
				return { code, meta: { test: { transformed: id } } };
			},

			moduleParsed({ id, meta }) {
				assert.deepStrictEqual(meta, { test: { transformed: id } }, 'moduleParsed');
				moduleParsedCalls++;
			},

			buildEnd() {
				assert.deepStrictEqual(
					[...this.getModuleIds()].map(id => ({ id, meta: this.getModuleInfo(id).meta })),
					[
						{ id: 'entry', meta: { test: { transformed: 'entry' } } },
						{ id: 'foo', meta: { test: { transformed: 'foo' } } }
					],
					'buildEnd'
				);
			}
		};

		const bundle = await rollup.rollup({
			input: 'entry',
			plugins: [plugin]
		});
		assert.strictEqual(resolveIdCalls, 2);
		assert.strictEqual(transformCalls, 2);
		assert.strictEqual(moduleParsedCalls, 2);

		await rollup.rollup({
			input: 'entry',
			plugins: [plugin],
			cache: bundle
		});
		assert.strictEqual(resolveIdCalls, 3); // +1 for entry point which is resolved every time
		assert.strictEqual(transformCalls, 2);
		assert.strictEqual(moduleParsedCalls, 4); // should not be cached
	});

	it('runs shouldTransformCachedModule when using a cached module', async () => {
		let shouldTransformCachedModuleCalls = 0;

		const transformPlugin = {
			async shouldTransformCachedModule({ ast, id, meta, ...other }) {
				shouldTransformCachedModuleCalls++;
				assert.strictEqual(ast.type, 'Program');
				assert.deepStrictEqual(other, {
					code: modules[id],
					moduleSideEffects: true,
					syntheticNamedExports: false
				});
				switch (id) {
					case 'foo':
						assert.deepStrictEqual(meta, { transform: { calls: 1, id } });
						// we return promises to ensure they are awaited
						return Promise.resolve(false);
					case 'entry':
						assert.deepStrictEqual(meta, { transform: { calls: 0, id } });
						return Promise.resolve(true);
					default:
						throw new Error(`Unexpected id ${id}.`);
				}
			},
			transform: (code, id) => {
				return { meta: { transform: { calls: transformCalls, id } } };
			}
		};
		const cache = await rollup.rollup({
			input: 'entry',
			plugins: [transformPlugin, plugin]
		});
		assert.strictEqual(shouldTransformCachedModuleCalls, 0);
		assert.strictEqual(transformCalls, 2);

		const {
			cache: { modules: cachedModules }
		} = await rollup.rollup({
			input: 'entry',
			plugins: [transformPlugin, plugin],
			cache
		});
		assert.strictEqual(shouldTransformCachedModuleCalls, 2);
		assert.strictEqual(transformCalls, 3);
		assert.strictEqual(cachedModules[0].id, 'foo');
		assert.deepStrictEqual(cachedModules[0].meta, { transform: { calls: 1, id: 'foo' } });
		assert.strictEqual(cachedModules[1].id, 'entry');
		assert.deepStrictEqual(cachedModules[1].meta, { transform: { calls: 2, id: 'entry' } });
	});
});
