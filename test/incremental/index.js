const assert = require('node:assert');
/**
 * @type {import('../../src/rollup/types')} Rollup
 */
const rollup = require('../../dist/rollup');
const { executeBundle, getObject } = require('../utils.js');

describe('incremental', () => {
	let resolveIdCalls;
	let transformCalls;
	let modules;

	const plugin = {
		resolveId: id => {
			resolveIdCalls++;
			return id === 'external' ? false : id;
		},

		load: id => modules[id],

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
			.then(() => {
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
			.then(() =>
				rollup.rollup({
					input: 'entry',
					plugins: [plugin],
					cache
				})
			)
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
			.then(() =>
				rollup.rollup({
					input: 'entry',
					plugins: [plugin],
					cache
				})
			)
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
			.then(() =>
				rollup.rollup({
					input: 'entry',
					plugins: [plugin],
					cache
				})
			)
			.then(bundle => {
				assert.strictEqual(resolveIdCalls, 4);

				return executeBundle(bundle, require);
			})
			.then(result => {
				assert.strictEqual(result, 43);
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
					.catch(() => cache);
			})
			.then(cache => {
				modules.foo = `export default 42;`;

				return rollup
					.rollup({
						input: 'entry',
						plugins: [plugin],
						cache
					})
					.then(bundle => executeBundle(bundle))
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
						attributes: {},
						external: false,
						meta: {},
						moduleSideEffects: true,
						resolvedBy: 'at position 1',
						syntheticNamedExports: false
					},
					external: {
						id: 'external',
						attributes: {},
						external: true,
						meta: {},
						moduleSideEffects: true,
						resolvedBy: 'rollup',
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
					getObject([...this.getModuleIds()].map(id => [id, this.getModuleInfo(id).meta])),
					{
						entry: { test: { transformed: 'entry' } },
						foo: { test: { transformed: 'foo' } }
					},
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
		modules = {
			entry: `import foo from 'foo'; export default foo;`,
			foo: `export default import('bar')`,
			bar: `export default 42`
		};
		let shouldTransformCachedModuleCalls = 0;

		const transformPlugin = {
			async shouldTransformCachedModule({ ast, id, meta, resolvedSources, ...other }) {
				shouldTransformCachedModuleCalls++;
				assert.strictEqual(ast.type, 'Program');
				assert.deepStrictEqual(other, {
					code: modules[id],
					moduleSideEffects: true,
					syntheticNamedExports: false
				});
				switch (id) {
					case 'foo': {
						assert.deepStrictEqual(meta, { transform: { calls: 1, id } });
						assert.deepStrictEqual(resolvedSources, {
							__proto__: null,
							bar: {
								attributes: {},
								external: false,
								id: 'bar',
								meta: {},
								moduleSideEffects: true,
								resolvedBy: 'at position 1',
								syntheticNamedExports: false
							}
						});
						// we return promises to ensure they are awaited
						return false;
					}
					case 'bar': {
						assert.deepStrictEqual(meta, { transform: { calls: 2, id } });
						assert.deepStrictEqual(resolvedSources, { __proto__: null });
						return false;
					}
					case 'entry': {
						assert.deepStrictEqual(meta, { transform: { calls: 0, id } });
						assert.deepStrictEqual(resolvedSources, {
							__proto__: null,
							foo: {
								attributes: {},
								external: false,
								id: 'foo',
								meta: {},
								moduleSideEffects: true,
								resolvedBy: 'at position 1',
								syntheticNamedExports: false
							}
						});
						return true;
					}
					default: {
						throw new Error(`Unexpected id ${id}.`);
					}
				}
			},
			transform: (code, id) => ({ meta: { transform: { calls: transformCalls, id } } })
		};
		const cache = await rollup.rollup({
			input: 'entry',
			plugins: [transformPlugin, plugin]
		});
		assert.strictEqual(
			shouldTransformCachedModuleCalls,
			0,
			'initial shouldTransformCachedModule calls'
		);
		assert.strictEqual(transformCalls, 3, 'initial transform calls');

		const {
			cache: { modules: cachedModules }
		} = await rollup.rollup({
			input: 'entry',
			plugins: [transformPlugin, plugin],
			cache
		});
		assert.strictEqual(
			shouldTransformCachedModuleCalls,
			3,
			'final shouldTransformCachedModule calls'
		);
		assert.strictEqual(transformCalls, 4, 'final transform calls');
		assert.strictEqual(cachedModules[0].id, 'foo');
		assert.deepStrictEqual(cachedModules[0].meta, { transform: { calls: 1, id: 'foo' } });
		assert.strictEqual(cachedModules[1].id, 'entry');
		assert.deepStrictEqual(cachedModules[1].meta, { transform: { calls: 3, id: 'entry' } });
		assert.strictEqual(cachedModules[2].id, 'bar');
		assert.deepStrictEqual(cachedModules[2].meta, { transform: { calls: 2, id: 'bar' } });
	});
});
