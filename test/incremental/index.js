const assert = require('node:assert');
const { default: MagicString } = require('magic-string');
/**
 * @type {import('../../src/rollup/types')} Rollup
 */
const rollup = require('../../dist/rollup');
const { executeBundle, getBundleCode, getObject } = require('../testHelpers.js');

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

	it('deconflicts variables again if needed', async () => {
		modules.entry = `import value from 'foo'; const test = 'main'; export default test + value;`;
		modules.foo = `const otherTest = 'foo'; export default otherTest;`;
		const firstBundle = await rollup.rollup({
			input: 'entry',
			plugins: [plugin]
		});
		assert.strictEqual(await executeBundle(firstBundle), 'mainfoo');

		// Now we introduce a name conflict
		modules.foo = `const test = 'foo'; export default test;`;
		const secondBundle = await rollup.rollup({
			input: 'entry',
			plugins: [plugin],
			cache: firstBundle
		});
		assert.strictEqual(await executeBundle(secondBundle), 'mainfoo');
	});

	it('consistently deconflicts default exports', async () => {
		modules.entry = `export default 2; const entry = 1; console.log(entry);`;
		const firstBundle = await rollup.rollup({
			input: 'entry',
			plugins: [plugin]
		});
		const firstCode = await getBundleCode(firstBundle);
		assert.strictEqual(
			firstCode,
			'var entry_default = 2; const entry = 1; console.log(entry);\n\nexport { entry_default as default };\n',
			'first'
		);

		const secondBundle = await rollup.rollup({
			input: 'entry',
			plugins: [plugin],
			cache: firstBundle
		});
		assert.strictEqual(await getBundleCode(secondBundle), firstCode, 'second');
	});

	it('uses consistent variable names between formats', async () => {
		modules.entry = `{
  const _interopDefault = 1;
  const _interopNamespace = 1;
  const module = 1;
  const require = 1;
  const exports = 1;
  const document = 1;
  const URL = 1;
  console.log(_interopDefault, _interopNamespace, module, require, exports, document, URL, import.meta.url);
  import('external').then(console.log);
}`;
		const FORMATS = ['amd', 'cjs', 'system', 'es', 'iife', 'umd'];
		for (const targetFormat of FORMATS) {
			const initialCode = await getBundleCode(
				await rollup.rollup({
					input: 'entry',
					plugins: [plugin]
				}),
				{ format: targetFormat }
			);
			for (const otherFormat of FORMATS) {
				const firstBundle = await rollup.rollup({
					input: 'entry',
					plugins: [plugin]
				});
				await getBundleCode(firstBundle, { format: otherFormat });
				const secondBundle = await rollup.rollup({
					input: 'entry',
					plugins: [plugin],
					cache: firstBundle
				});
				assert.strictEqual(
					await getBundleCode(secondBundle, { format: targetFormat }),
					initialCode,
					'second'
				);
			}
		}
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

	it('makes cached module meta available in shouldTransformCachedModule', async () => {
		modules = {
			entry: `import foo from 'foo'; export default foo;`,
			foo: `export default 42`
		};
		let shouldTransformCachedModuleCalls = 0;

		const metaPlugin = {
			resolveId: id => id,
			load: id => ({ code: modules[id] }),
			shouldTransformCachedModule({ id }) {
				shouldTransformCachedModuleCalls++;
				assert.deepStrictEqual(this.getModuleInfo(id).meta, { transform: { id } });
				return false;
			},
			transform: (code, id) => ({ code, meta: { transform: { id } } })
		};

		const cache = await rollup.rollup({
			input: 'entry',
			plugins: [metaPlugin]
		});

		await rollup.rollup({
			input: 'entry',
			plugins: [metaPlugin],
			cache
		});

		assert.strictEqual(shouldTransformCachedModuleCalls, 2);
	});

	it('keeps meta from the current resolution when reusing a cached module', async () => {
		modules = {
			entry: `import foo from 'foo'; export default foo;`,
			foo: `export default 42`
		};
		let run = 1;
		const metaPlugin = {
			resolveId(id) {
				return { id, meta: { [`resolvedInRun${run}`]: true } };
			},
			load: id => ({ code: modules[id] }),
			transform: (code, id) => ({ code, meta: { transform: { id } } })
		};
		const capturedMeta = {};
		const capturePlugin = {
			name: 'capture',
			moduleParsed({ id, meta }) {
				capturedMeta[id] = { ...meta };
			}
		};

		const cache = await rollup.rollup({
			input: 'entry',
			plugins: [metaPlugin, capturePlugin]
		});

		run = 2;
		await rollup.rollup({
			input: 'entry',
			plugins: [metaPlugin, capturePlugin],
			cache
		});

		assert.deepStrictEqual(capturedMeta, {
			// The entry point is re-resolved each run, so its current meta is merged in
			entry: { resolvedInRun2: true, resolvedInRun1: true, transform: { id: 'entry' } },
			// Dependencies are resolved from cached resolvedIds, so they keep the original meta
			foo: { resolvedInRun1: true, transform: { id: 'foo' } }
		});
	});

	it('restores the current module options when shouldTransformCachedModule triggers a re-transform', async () => {
		modules = {
			entry: `export const foo = 1; export default foo + 1;`
		};
		let run = 1;
		let shouldTransformCachedModuleCalls = 0;
		const optionsPlugin = {
			resolveId(id) {
				return {
					id,
					meta: { [`resolvedInRun${run}`]: true },
					moduleSideEffects: run === 1,
					syntheticNamedExports: run === 1 ? 'foo' : false
				};
			},
			load: id => ({ code: modules[id] }),
			transform(code, id) {
				// During the fresh transform, only the meta of the current resolution is present
				assert.deepStrictEqual(
					this.getModuleInfo(id).meta,
					{ [`resolvedInRun${run}`]: true },
					'transform'
				);
				return { code, meta: { [`transformedInRun${run}`]: true } };
			},
			shouldTransformCachedModule({ id }) {
				shouldTransformCachedModuleCalls++;
				const moduleInfo = this.getModuleInfo(id);
				// While the hook runs, the cached module options are exposed on top of the current ones
				assert.deepStrictEqual(
					moduleInfo.meta,
					{
						resolvedInRun2: true,
						resolvedInRun1: true,
						transformedInRun1: true
					},
					'shouldTransformCachedModule'
				);
				assert.strictEqual(moduleInfo.moduleSideEffects, true);
				assert.strictEqual(moduleInfo.syntheticNamedExports, 'foo');
				return true;
			}
		};
		const capturedInfo = {};
		const capturePlugin = {
			name: 'capture',
			moduleParsed(moduleInfo) {
				capturedInfo[moduleInfo.id] = {
					meta: { ...moduleInfo.meta },
					moduleSideEffects: moduleInfo.moduleSideEffects,
					syntheticNamedExports: moduleInfo.syntheticNamedExports
				};
			}
		};

		const cache = await rollup.rollup({
			input: 'entry',
			plugins: [optionsPlugin, capturePlugin]
		});

		run = 2;
		await rollup.rollup({
			input: 'entry',
			plugins: [optionsPlugin, capturePlugin],
			cache
		});

		assert.strictEqual(shouldTransformCachedModuleCalls, 1);
		assert.deepStrictEqual(capturedInfo, {
			entry: {
				meta: { resolvedInRun2: true, transformedInRun2: true },
				moduleSideEffects: false,
				syntheticNamedExports: false
			}
		});
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
					attributes: {},
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

	it('reflects a changed sourcemap of an unchanged source in the output', async () => {
		let header = '// header';
		const sourcemapPlugin = {
			name: 'sourcemap-plugin',
			resolveId: id => id,
			load(id) {
				const magicString = new MagicString(`${header}\nexport default 42;\n`);
				magicString.replace(/\/\/ [^\n]*\n/, '');
				return {
					code: magicString.toString(),
					map: magicString.generateMap({ includeContent: true, source: id })
				};
			}
		};
		const generate = async cache => {
			const bundle = await rollup.rollup({ input: 'entry', cache, plugins: [sourcemapPlugin] });
			const { output } = await bundle.generate({ format: 'es', sourcemap: true });
			return [bundle, output[0].map];
		};

		const [firstBundle, firstMap] = await generate();
		header = '// a different header';
		const [secondBundle, secondMap] = await generate(firstBundle);

		assert.deepStrictEqual(
			secondMap.sourcesContent,
			['// a different header\nexport default 42;\n'],
			'the new sourcemap should be used for the cached module'
		);
		assert.notDeepStrictEqual(secondMap, firstMap);
		assert.strictEqual(
			secondBundle.cache.modules[0].originalSourcemap.sourcesContent[0],
			'// a different header\nexport default 42;\n',
			'the cache should contain the new sourcemap'
		);
	});

	it('reuses a cached module when the load hook returns an equal sourcemap object', async () => {
		let transformCalls = 0;
		const sourcemapPlugin = {
			name: 'sourcemap-plugin',
			resolveId: id => id,
			load(id) {
				const magicString = new MagicString('// header\nexport default 42;\n');
				magicString.replace(/\/\/ [^\n]*\n/, '');
				return {
					code: magicString.toString(),
					// A new object with unchanged content, as most plugins return
					map: magicString.generateMap({ includeContent: true, source: id })
				};
			},
			transform(code, id) {
				transformCalls++;
				const magicString = new MagicString(code);
				magicString.append('export const transformed = 1;\n');
				return {
					code: magicString.toString(),
					map: magicString.generateMap({ includeContent: true, source: id })
				};
			}
		};
		const firstBundle = await rollup.rollup({ input: 'entry', plugins: [sourcemapPlugin] });
		assert.strictEqual(transformCalls, 1);
		await rollup.rollup({ input: 'entry', plugins: [sourcemapPlugin], cache: firstBundle });
		assert.strictEqual(
			transformCalls,
			1,
			'an equal sourcemap should not invalidate the module cache'
		);
	});
});
