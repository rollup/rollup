const path = require('path');
const assert = require('assert');
const sander = require('sander');
const { loader } = require('../utils.js');
const rollup = require('../../dist/rollup.js');

describe('hooks', () => {
	it('supports buildStart and buildEnd hooks', () => {
		let buildStartCnt = 0;
		let buildEndCnt = 0;
		return rollup
			.rollup({
				input: 'input',
				plugins: [
					loader({ input: `alert('hello')` }),
					{
						buildStart() {
							buildStartCnt++;
							assert(this.meta);
							assert(this.meta.rollupVersion);
						},
						buildEnd() {
							buildEndCnt++;
							assert(this.meta);
							assert(this.meta.rollupVersion);
						}
					}
				]
			})
			.then(bundle => {
				assert.equal(buildStartCnt, 1);
				assert.equal(buildEndCnt, 1);

				return rollup.rollup({
					input: 'input',
					plugins: [
						loader({ input: `invalid_source - @#$%^&*` }),
						{
							buildStart() {
								buildStartCnt++;
							},
							buildEnd() {
								buildEndCnt++;
							}
						}
					]
				});
			})
			.catch(err => {
				assert.ok(err);
			})
			.then(() => {
				assert.equal(buildStartCnt, 2);
				assert.equal(buildEndCnt, 2);
			});
	});

	it('supports warnings in buildStart and buildEnd hooks', () => {
		let callCnt = 0;
		return rollup
			.rollup({
				input: 'input',
				onwarn(warning) {
					if (callCnt === 0) {
						assert.equal(warning.message, 'build start');
						callCnt++;
					} else if (callCnt === 1) {
						assert.equal(warning.message, 'build end');
						callCnt++;
					}
				},
				plugins: [
					loader({ input: `alert('hello')` }),
					{
						buildStart() {
							this.warn('build start');
						},
						buildEnd() {
							this.warn('build end');
						}
					}
				]
			})
			.then(() => {
				assert.equal(callCnt, 2);
			});
	});

	it('passes errors to the buildEnd hook', () => {
		let handledError = false;
		return rollup
			.rollup({
				input: 'input',
				plugins: [
					loader({ input: `alert('hello')` }),
					{
						buildStart() {
							this.error('build start error');
						},
						buildEnd(error) {
							assert.equal(error.message, 'build start error');
							handledError = true;
						}
					}
				]
			})
			.catch(error => {
				assert.ok(handledError);
				assert.equal(error.message, 'build start error');
			})
			.then(() => {
				assert.ok(handledError);
			});
	});

	it('supports isExternal on plugin context', () => {
		return rollup.rollup({
			input: 'input',
			external: ['test'],
			plugins: [
				loader({ input: `alert('hello')` }),
				{
					buildStart() {
						assert.equal(this.isExternal('test'), true);
						assert.equal(this.isExternal('another'), false);
					}
				}
			]
		});
	});

	it('supports resolveId on plugin context', () => {
		return rollup
			.rollup({
				input: 'input',
				plugins: [
					loader({
						input: `import 'test'`,
						dep1: `import 'next'`,
						dep2: `alert('hello')`
					}),
					{
						resolveId(id) {
							if (id === 'test') return 'dep1';
							if (id === 'next') return this.resolveId('final');
							if (id === 'final') return 'dep2';
						}
					}
				]
			})
			.then(bundle => {
				return bundle.generate({ format: 'es' });
			})
			.then(({ output: [output] }) => {
				assert.equal(output.code, `alert('hello');\n`);
			});
	});

	it('passes bundle & output object to ongenerate & onwrite hooks, with deprecation warnings', () => {
		const file = path.join(__dirname, 'tmp/bundle.js');

		let deprecationCnt = 0;

		return rollup
			.rollup({
				input: 'input',
				onwarn(warning) {
					deprecationCnt++;
					if (deprecationCnt === 1) {
						assert.equal(warning.pluginCode, 'ONGENERATE_HOOK_DEPRECATED');
						assert.equal(
							warning.message,
							'The ongenerate hook used by plugin at position 2 is deprecated. The generateBundle hook should be used instead.'
						);
					} else {
						assert.equal(warning.pluginCode, 'ONWRITE_HOOK_DEPRECATED');
						assert.equal(
							warning.message,
							'The onwrite hook used by plugin at position 2 is deprecated. The generateBundle hook should be used instead.'
						);
					}
				},
				plugins: [
					loader({ input: `alert('hello')` }),
					{
						ongenerate(bundle, out) {
							out.ongenerate = true;
						},

						onwrite(bundle, out) {
							assert.equal(out.ongenerate, true);
						}
					}
				]
			})
			.then(bundle => {
				return bundle.write({
					file,
					format: 'es'
				});
			})
			.then(() => {
				assert.equal(deprecationCnt, 2);
				return sander.unlink(file);
			});
	});

	it('calls ongenerate hooks in sequence', () => {
		const result = [];

		return rollup
			.rollup({
				input: 'input',
				plugins: [
					loader({ input: `alert('hello')` }),
					{
						ongenerate(info) {
							result.push({ a: info.format });
						}
					},
					{
						ongenerate(info) {
							result.push({ b: info.format });
						}
					}
				]
			})
			.then(bundle => bundle.generate({ format: 'cjs' }))
			.then(() => {
				assert.deepEqual(result, [{ a: 'cjs' }, { b: 'cjs' }]);
			});
	});

	it('calls onwrite hooks in sequence', () => {
		const result = [];
		const file = path.join(__dirname, 'tmp/bundle.js');

		return rollup
			.rollup({
				input: 'input',
				plugins: [
					loader({ input: `alert('hello')` }),
					{
						onwrite(info) {
							return new Promise(fulfil => {
								setTimeout(() => {
									result.push({ a: info.file, format: info.format });
									fulfil();
								}, 10);
							});
						}
					},
					{
						onwrite(info) {
							result.push({ b: info.file, format: info.format });
						}
					}
				]
			})
			.then(bundle => {
				return bundle.write({
					file,
					format: 'cjs'
				});
			})
			.then(() => {
				assert.deepEqual(result, [{ a: file, format: 'cjs' }, { b: file, format: 'cjs' }]);

				return sander.unlink(file);
			});
	});

	it('supports asset emission', () => {
		return rollup
			.rollup({
				input: 'input',
				plugins: [
					loader({ input: '' }),
					{
						transform() {
							const assetId = this.emitAsset('test.ext', 'hello world');
							return `export default import.meta.ROLLUP_ASSET_URL_${assetId};`;
						}
					}
				]
			})
			.then(bundle => {
				return bundle.generate({ format: 'es' });
			})
			.then(({ output }) => {
				assert.equal(output[1].isAsset, true);
				assert.equal(output[1].fileName, 'assets/test-19916f7d.ext');
				assert.equal(output[1].source, 'hello world');
				assert.equal(output[0].fileName, 'input.js');
				assert.equal(output[0].isEntry, true);
				assert.equal(
					output[0].code,
					`var input = new URL('../assets/test-19916f7d.ext', import.meta.url).href;\n\nexport default input;\n`
				);
			});
	});

	it('caches asset emission in transform hook', () => {
		let cache;
		return rollup
			.rollup({
				input: 'input',
				plugins: [
					loader({ input: '' }),
					{
						transform() {
							const assetId = this.emitAsset('test.ext', 'hello world');
							return `export default import.meta.ROLLUP_ASSET_URL_${assetId};`;
						}
					}
				]
			})
			.then(bundle => {
				cache = bundle.cache;
				return bundle.generate({ format: 'es' });
			})
			.then(({ output }) => {
				assert.equal(
					output[0].code,
					`var input = new URL('../assets/test-19916f7d.ext', import.meta.url).href;\n\nexport default input;\n`
				);
				assert.equal(output[1].fileName, 'assets/test-19916f7d.ext');
				assert.equal(output[1].source, 'hello world');
				assert.equal(output[1].fileName, 'assets/test-19916f7d.ext');
				assert.equal(output[1].source, 'hello world');

				return rollup.rollup({
					cache,
					input: 'input',
					plugins: [
						loader({ input: '' }),
						{
							transform() {
								assert.fail('Should cache transform');
							}
						}
					]
				});
			})
			.then(bundle => {
				return bundle.generate({ format: 'es' });
			})
			.then(({ output }) => {
				assert.equal(
					output[0].code,
					`var input = new URL('../assets/test-19916f7d.ext', import.meta.url).href;\n\nexport default input;\n`
				);
				assert.equal(output[1].fileName, 'assets/test-19916f7d.ext');
				assert.equal(output[1].source, 'hello world');
				assert.equal(output[1].fileName, 'assets/test-19916f7d.ext');
				assert.equal(output[1].source, 'hello world');
			});
	});

	it('opts-out transform hook cache for custom cache', () => {
		let runs = 0;
		let cache;
		return rollup
			.rollup({
				input: 'input',
				plugins: [
					loader({ input: '' }),
					{
						name: 'x',
						transform() {
							this.cache.set('asdf', 'asdf');
							runs++;
							const assetId = this.emitAsset('test.ext', 'hello world');
							return `export default import.meta.ROLLUP_ASSET_URL_${assetId};`;
						}
					}
				]
			})
			.then(bundle => {
				cache = bundle.cache;
				return bundle.generate({ format: 'es' });
			})
			.then(({ output }) => {
				assert.equal(
					output[0].code,
					`var input = new URL('../assets/test-19916f7d.ext', import.meta.url).href;\n\nexport default input;\n`
				);
				assert.equal(output[1].fileName, 'assets/test-19916f7d.ext');
				assert.equal(output[1].source, 'hello world');
				assert.equal(output[1].fileName, 'assets/test-19916f7d.ext');
				assert.equal(output[1].source, 'hello world');

				return rollup.rollup({
					cache,
					input: 'input',
					plugins: [
						loader({ input: '' }),
						{
							name: 'x',
							transform() {
								runs++;
								return `alert('hello world')`;
							}
						}
					]
				});
			})
			.then(bundle => {
				return bundle.generate({ format: 'es' });
			})
			.then(({ output }) => {
				assert.equal(runs, 2);
				assert.equal(output[0].code.trim(), `alert('hello world');`);
				assert.equal(output.length, 1);
			});
	});

	it('supports CommonJS asset urls', () => {
		return rollup
			.rollup({
				input: 'input',
				plugins: [
					loader({ input: '' }),
					{
						transform() {
							const assetId = this.emitAsset('test.ext', 'hello world');
							return `export default import.meta.ROLLUP_ASSET_URL_${assetId};`;
						}
					}
				]
			})
			.then(bundle => {
				return bundle.generate({ format: 'cjs' });
			})
			.then(({ output: [{ code }] }) => {
				assert.equal(
					code,
					`'use strict';

var input = new (typeof URL !== 'undefined' ? URL : require('ur'+'l').URL)((process.browser ? '' : 'file:') + __dirname + '/assets/test-19916f7d.ext', process.browser && document.baseURI).href;

module.exports = input;
`
				);
			});
	});

	it('supports custom asset file names', () => {
		return rollup
			.rollup({
				input: 'input',
				plugins: [
					loader({ input: `alert('hello')` }),
					{
						transform() {
							this.emitAsset('test.ext', 'hello world');
							return '';
						}
					}
				]
			})
			.then(bundle => {
				return bundle.generate({
					format: 'es',
					assetFileNames: '[name][extname]'
				});
			})
			.then(({ output: [, output] }) => {
				assert.equal(output.fileName, 'test.ext');
				assert.equal(output.source, 'hello world');
			});
	});

	it('allows setting asset source separately', () => {
		let assetId;
		return rollup
			.rollup({
				input: 'input',
				plugins: [
					loader({ input: `alert('hello')` }),
					{
						transform() {
							assetId = this.emitAsset('test.ext');
							return '';
						},
						generateBundle() {
							this.setAssetSource(assetId, 'hello world');
						}
					}
				]
			})
			.then(bundle => {
				return bundle.generate({ format: 'es' });
			})
			.then(({ output: [, output] }) => {
				assert.equal(output.fileName, 'assets/test-19916f7d.ext');
				assert.equal(output.source, 'hello world');
			});
	});

	it('throws when calling setAssetSource in transform', () => {
		return rollup
			.rollup({
				input: 'input',
				plugins: [
					loader({ input: `alert('hello')` }),
					{
						transform() {
							const assetId = this.emitAsset('test.ext');
							this.setAssetSource(assetId, 'asdf');
							return '';
						}
					}
				]
			})
			.then(({ output }) => {
				throw new Error('should fail');
			})
			.catch(err => {
				assert.equal(err.code, 'PLUGIN_ERROR');
				assert.equal(err.pluginCode, 'INVALID_SETASSETSOURCE');
			});
	});

	it('throws when setting asset source twice', () => {
		let thrown = false;
		return rollup
			.rollup({
				input: 'input',
				plugins: [
					loader({ input: `alert('hello')` }),
					{
						buildEnd() {
							const assetId = this.emitAsset('test.ext');
							this.setAssetSource(assetId, 'hello world');
							try {
								this.setAssetSource(assetId, 'another');
							} catch (e) {
								assert.equal(e.code, 'ASSET_SOURCE_ALREADY_SET');
								thrown = true;
								return '';
							}
							assert.fail();
						}
					}
				]
			})
			.then(bundle => {
				return bundle.generate({ format: 'es' });
			})
			.then(({ output: [, output] }) => {
				assert.equal(output.source, 'hello world');
				assert.equal(thrown, true);
			});
	});

	it('allows setting asset source at generateBundle', () => {
		let assetId;
		return rollup
			.rollup({
				input: 'input',
				plugins: [
					loader({ input: `alert('hello')` }),
					{
						transform() {
							return '';
						},
						generateBundle() {
							assetId = this.emitAsset('test.ext');
							this.setAssetSource(assetId, 'hello world');
						}
					}
				]
			})
			.then(bundle => {
				return bundle.generate({ format: 'es' });
			})
			.then(({ output: [, output] }) => {
				assert.equal(output.source, 'hello world');
			});
	});

	it('supports transformChunk in place of transformBundle, with deprecation warning', () => {
		let calledHook = false;
		let deprecationCnt = 0;
		return rollup
			.rollup({
				input: 'input',
				onwarn(warning) {
					deprecationCnt++;
					assert.equal(warning.pluginCode, 'TRANSFORMCHUNK_HOOK_DEPRECATED');
					assert.equal(
						warning.message,
						'The transformChunk hook used by plugin at position 2 is deprecated. The renderChunk hook should be used instead.'
					);
				},
				plugins: [
					loader({ input: `alert('hello')` }),
					{
						transformChunk(code, id) {
							calledHook = true;
							try {
								this.emitAsset('test.ext', 'hello world');
							} catch (e) {
								assert.equal(e.code, 'ASSETS_ALREADY_FINALISED');
							}
						}
					}
				]
			})
			.then(bundle => {
				return bundle.generate({
					format: 'es',
					assetFileNames: '[name][extname]'
				});
			})
			.then(() => {
				assert.equal(deprecationCnt, 1);
				assert.equal(calledHook, true);
			});
	});

	it('supports renderChunk in place of transformBundle and transformChunk', () => {
		let calledHook = false;
		return rollup
			.rollup({
				input: 'input',
				plugins: [
					loader({ input: `alert('hello')` }),
					{
						renderChunk(code, chunk, options) {
							calledHook = true;
							assert.equal(chunk.fileName, 'input.js');
							assert.equal(chunk.isEntry, true);
							assert.equal(chunk.exports.length, 0);
							assert.ok(chunk.modules['input']);
							try {
								this.emitAsset('test.ext', 'hello world');
							} catch (e) {
								assert.equal(e.code, 'ASSETS_ALREADY_FINALISED');
							}
						}
					}
				]
			})
			.then(bundle => {
				return bundle.generate({
					format: 'es',
					assetFileNames: '[name][extname]'
				});
			})
			.then(() => {
				assert.equal(calledHook, true);
			});
	});

	it('supports renderChunk in place of transformBundle and transformChunk', () => {
		let calledHook = false;
		return rollup
			.rollup({
				input: 'input',
				plugins: [
					loader({ input: `alert('hello')` }),
					{
						renderChunk(code, chunk, options) {
							calledHook = true;
							assert.equal(chunk.fileName, 'input.js');
							assert.equal(chunk.isEntry, true);
							assert.equal(chunk.exports.length, 0);
							assert.ok(chunk.modules['input']);
							try {
								this.emitAsset('test.ext', 'hello world');
							} catch (e) {
								assert.equal(e.code, 'ASSETS_ALREADY_FINALISED');
							}
						}
					}
				]
			})
			.then(bundle => {
				return bundle.generate({
					format: 'es',
					assetFileNames: '[name][extname]'
				});
			})
			.then(() => {
				assert.equal(calledHook, true);
			});
	});

	it('passes bundle object to generateBundle hook', () => {
		return rollup
			.rollup({
				input: 'input',
				plugins: [
					loader({ input: `alert('hello')` }),
					{
						transform() {
							const assetId = this.emitAsset('test.ext', 'hello world');
							return `export default import.meta.ROLLUP_ASSET_URL_${assetId};`;
						},
						generateBundle(options, outputBundle, isWrite) {
							assert.equal(outputBundle['assets/test-19916f7d.ext'].source, 'hello world');
							assert.equal(
								outputBundle['input.js'].code,
								`var input = new URL('../assets/test-19916f7d.ext', import.meta.url).href;\n\nexport default input;\n`
							);
						}
					}
				]
			})
			.then(bundle => {
				return bundle.generate({ format: 'es' });
			});
	});

	it('supports assets uniquely defined in the generateBundle hook', () => {
		return rollup
			.rollup({
				input: 'input',
				plugins: [
					loader({ input: `alert('hello')` }),
					{
						generateBundle(options) {
							if (options.format === 'es') {
								const depAssetId = this.emitAsset('lateDepAsset', 'custom source');
								const source = `references ${this.getAssetFileName(depAssetId)}`;
								this.emitAsset('lateMainAsset', source);
							} else {
								const depAssetId = this.emitAsset('lateDepAsset', 'different source');
								const source = `references ${this.getAssetFileName(depAssetId)}`;
								this.emitAsset('lateMainAsset', source);
							}
						}
					}
				]
			})
			.then(bundle =>
				bundle
					.generate({ format: 'es' })
					.then(outputBundle1 =>
						bundle.generate({ format: 'cjs' }).then(outputBundle2 => [outputBundle1, outputBundle2])
					)
			)
			.then(([{ output: output1 }, { output: output2 }]) => {
				assert.equal(output1.length, 3);
				assert.equal(output1[0].code, `alert('hello');\n`);
				assert.equal(output1[1].source, 'custom source');
				assert.equal(output1[2].source, `references assets/lateDepAsset-671f747d`);

				assert.equal(output2.length, 3);
				assert.equal(output2[0].code, `'use strict';\n\nalert('hello');\n`);
				assert.equal(output2[1].source, 'different source');
				assert.equal(output2[2].source, `references assets/lateDepAsset-c107f5fc`);
			});
	});

	it('supports errors thrown in the generateBundle hook', () => {
		return rollup
			.rollup({
				input: 'input',
				plugins: [
					loader({ input: `alert('hello')` }),
					{
						generateBundle() {
							this.error('test error');
						}
					}
				]
			})
			.then(bundle => {
				return bundle.generate({ format: 'es' });
			})
			.catch(err => {
				assert.equal(err.message, 'test error');
			});
	});

	it('supports generateBundle hook including reporting rendered exports and source length', () => {
		return rollup
			.rollup({
				input: 'input',
				plugins: [
					loader({
						input: `export { a as default } from 'dep';`,
						dep: `export var a = 1; export var b = 2;`
					}),
					{
						generateBundle(options, outputBundle, isWrite) {
							assert.strictEqual(isWrite, false);
							const chunk = outputBundle['input.js'];

							// can detect that b has been tree-shaken this way
							assert.equal(chunk.modules['dep'].renderedExports[0], 'a');
							assert.equal(chunk.modules['dep'].renderedExports.length, 1);

							assert.equal(chunk.modules['dep'].removedExports[0], 'b');
							assert.equal(chunk.modules['dep'].removedExports.length, 1);

							assert.equal(chunk.modules['dep'].renderedLength, 10);
							assert.equal(chunk.modules['dep'].originalLength, 35);
						}
					}
				]
			})
			.then(bundle => bundle.generate({ format: 'es' }));
	});

	it('supports writeBundle hook', () => {
		const file = path.join(__dirname, 'tmp/bundle.js');
		let bundle;
		let callCount = 0;
		return rollup
			.rollup({
				input: 'input',
				plugins: [
					loader({
						input: `export { a as default } from 'dep';`,
						dep: `export var a = 1; export var b = 2;`
					}),
					{
						generateBundle(options, outputBundle, isWrite) {
							bundle = outputBundle;
							assert.strictEqual(isWrite, true);
						}
					},
					{
						writeBundle(outputBundle) {
							assert.deepStrictEqual(outputBundle, bundle);
							callCount++;
						}
					}
				]
			})
			.then(bundle => bundle.write({ format: 'esm', file }))
			.then(() => assert.strictEqual(callCount, 1));
	});

	it('supports this.cache for plugins', () => {
		return rollup
			.rollup({
				input: 'input',
				plugins: [
					loader({ input: `alert('hello')` }),
					{
						name: 'cachePlugin',
						buildStart() {
							this.cache.set('asdf', 'asdf');
						}
					}
				]
			})
			.then(bundle => {
				return rollup.rollup({
					input: 'input',
					cache: bundle.cache,
					plugins: [
						loader({ input: `alert('hello')` }),
						{
							name: 'cachePlugin',
							buildStart() {
								assert.ok(this.cache.has('asdf'));
								assert.equal(this.cache.get('asdf'), 'asdf');
							}
						}
					]
				});
			});
	});

	it('throws for anonymous plugins using the cache', () => {
		return rollup
			.rollup({
				input: 'input',
				plugins: [
					loader({ input: `alert('hello')` }),
					{
						buildStart() {
							this.cache.set('asdf', 'asdf');
						}
					}
				]
			})
			.then(() => {
				assert.fail('Should have thrown');
			})
			.catch(err => {
				assert.equal(err.code, 'PLUGIN_ERROR');
				assert.equal(err.pluginCode, 'ANONYMOUS_PLUGIN_CACHE');
			});
	});

	it('throws for two plugins using the same name and the cache', () => {
		// we don't throw for duplicate names unless there is cache access
		return rollup
			.rollup({
				input: 'input',
				plugins: [
					loader({ input: `alert('hello')` }),
					{
						name: 'a'
					},
					{
						name: 'a'
					}
				]
			})
			.then(() => {
				const name = 'MyTestPluginName';
				return rollup
					.rollup({
						input: 'input',
						plugins: [
							loader({ input: `alert('hello')` }),
							{
								name,
								buildStart() {
									this.cache.set('asdf', 'asdf');
								}
							},
							{
								name,
								buildStart() {
									this.cache.set('asdf', 'asdf');
								}
							}
						]
					})
					.catch(err => {
						assert.equal(err.code, 'PLUGIN_ERROR');
						assert.equal(err.pluginCode, 'DUPLICATE_PLUGIN_NAME');
						assert.equal(err.message.includes(name), true);
					});
			});
	});

	it('Allows plugins with any names using a shared cacheKey', () => {
		return rollup.rollup({
			input: 'input',
			plugins: [
				loader({ input: `alert('hello')` }),
				{
					name: 'a',
					cacheKey: 'a9b6',
					buildStart() {
						this.cache.set('asdf', 'asdf');
					}
				},
				{
					name: 'a',
					cacheKey: 'a9b6',
					buildEnd() {
						assert.equal(this.cache.get('asdf'), 'asdf');
					}
				},
				{
					name: 'b',
					cacheKey: 'a9b6',
					buildEnd() {
						assert.equal(this.cache.get('asdf'), 'asdf');
					}
				}
			]
		});
	});

	it('Evicts cache entries after cacheExpiry runs with no usage', () => {
		return rollup
			.rollup({
				input: 'input',
				experimentalCacheExpiry: 5,
				plugins: [
					loader({ input: `alert('hello')` }),
					{
						name: 'x',
						buildStart() {
							this.cache.set('first', 'first');
							this.cache.set('second', 'second');
						}
					}
				]
			})
			.then(bundle => {
				let promise = Promise.resolve();
				for (let i = 0; i < 5; i++) {
					promise = promise.then(() => {
						return rollup.rollup({
							cache: bundle.cache,
							input: 'input',
							experimentalCacheExpiry: 5,
							plugins: [
								loader({ input: `alert('hello')` }),
								{
									name: 'x',
									buildStart() {
										if (i === 4) assert.equal(this.cache.has('second'), true);
									}
								}
							]
						});
					});
				}
				return promise;
			})
			.then(bundle => {
				return rollup.rollup({
					cache: bundle.cache,
					input: 'input',
					experimentalCacheExpiry: 5,
					plugins: [
						loader({ input: `alert('hello')` }),
						{
							name: 'x',
							buildStart() {
								assert.equal(this.cache.has('first'), false);
								assert.equal(this.cache.get('first'), undefined);
								assert.equal(this.cache.get('second'), 'second');
							}
						}
					]
				});
			});
	});

	it('Supports disabling the cache with cache: false', () => {
		return rollup
			.rollup({
				input: 'input',
				cache: false,
				plugins: [
					loader({ input: `alert('hello')` }),
					{
						name: 'x',
						buildStart() {
							this.cache.set('x', 'x');
							assert.equal(this.cache.has('x'), false);
							assert.equal(this.cache.get('x'), undefined);
						}
					}
				]
			})
			.then(bundle => {
				assert.equal(bundle.cache, undefined);
			});
	});

	it('Disables the default transform cache when using cache in transform only', () => {
		return rollup
			.rollup({
				input: 'input',
				plugins: [
					loader({ input: `alert('hello')` }),
					{
						name: 'x',
						transform() {
							this.cache.set('asdf', 'asdf');
							return `alert('hello world')`;
						}
					}
				]
			})
			.then(bundle => {
				return rollup.rollup({
					input: 'input',
					cache: bundle.cache,
					plugins: [
						loader({ input: `alert('hello')` }),
						{
							name: 'x',
							transform() {
								assert.equal(this.cache.get('asdf'), 'asdf');
								return `alert('hello')`;
							}
						}
					]
				});
			})
			.then(bundle => {
				return bundle.generate({
					format: 'es'
				});
			})
			.then(({ output }) => {
				assert.equal(output[0].code.trim(), `alert('hello');`);
			});
	});

	it('supports renderStart hook', () => {
		let renderStartCount = 0;
		let generateBundleCount = 0;
		let renderErrorCount = 0;
		return rollup
			.rollup({
				input: 'input',
				plugins: [
					loader({ input: `alert('hello')` }),
					{
						renderStart() {
							renderStartCount++;
							assert.equal(generateBundleCount, 0);
							assert.equal(renderErrorCount, 0);
						},
						generateBundle() {
							generateBundleCount++;
							assert.equal(renderStartCount, 1);
							assert.equal(renderErrorCount, 0);
						},
						renderError() {
							renderErrorCount++;
						}
					}
				]
			})
			.then(bundle => bundle.generate({ format: 'esm' }))
			.then(() => {
				assert.equal(renderStartCount, 1, 'renderStart count');
				assert.equal(generateBundleCount, 1, 'generateBundle count');
				assert.equal(renderErrorCount, 0, 'renderError count');
			});
	});

	it('supports renderError hook', () => {
		let renderStartCount = 0;
		let generateBundleCount = 0;
		let renderErrorCount = 0;
		return rollup
			.rollup({
				input: 'input',
				plugins: [
					loader({ input: `alert('hello')` }),
					{
						renderStart() {
							renderStartCount++;
						},
						renderChunk() {
							throw Error('renderChunk error');
						},
						generateBundle() {
							generateBundleCount++;
						},
						renderError(error) {
							assert(error);
							assert.equal(error.message, 'renderChunk error');
							assert.equal(renderStartCount, 1);
							renderErrorCount++;
						}
					}
				]
			})
			.then(bundle => bundle.generate({ format: 'esm' }))
			.catch(err => {
				assert.ok(err);
			})
			.then(() => {
				assert.equal(renderStartCount, 1, 'renderStart count');
				assert.equal(generateBundleCount, 0, 'generateBundle count');
				assert.equal(renderErrorCount, 1, 'renderError count');
			});
	});

	it('Warns when using deprecated this.watcher in plugins', () => {
		let warned = false;
		const watcher = rollup.watch({
			input: 'input',
			onwarn(warning) {
				warned = true;
				assert.equal(warning.code, 'PLUGIN_WARNING');
				assert.equal(warning.pluginCode, 'PLUGIN_WATCHER_DEPRECATED');
				assert.equal(
					warning.message,
					'this.watcher usage is deprecated in plugins. Use the watchChange plugin hook and this.addWatchFile() instead.'
				);
			},
			plugins: [
				loader({ input: `alert('hello')` }),
				{
					name: 'x',
					buildStart() {
						this.watcher.on('change', () => {});
					}
				}
			]
		});
		return new Promise((resolve, reject) => {
			watcher.on('event', evt => {
				if (evt.code === 'BUNDLE_END') resolve();
				else if (evt.code === 'ERROR' || evt.code === 'FATAL') reject(evt.error);
			});
		}).catch(err => {
			assert.equal(err.message, 'You must specify output.file or output.dir for the build.');
			assert.equal(warned, true);
		});
	});

	it('Warns when using deprecated transform dependencies in plugins', () => {
		let warned = false;
		const watcher = rollup.watch({
			input: 'input',
			output: {
				file: 'asdf',
				format: 'es'
			},
			onwarn(warning) {
				warned = true;
				assert.equal(warning.code, 'PLUGIN_WARNING');
				assert.equal(warning.pluginCode, 'TRANSFORM_DEPENDENCIES_DEPRECATED');
				assert.equal(
					warning.message,
					'Returning "dependencies" from plugin transform hook is deprecated for using this.addWatchFile() instead.'
				);
				// throw here to stop file system write
				throw new Error('STOP');
			},
			plugins: [
				loader({ input: `alert('hello')` }),
				{
					name: 'x',
					transform(code) {
						return { code, dependencies: [] };
					}
				}
			]
		});
		return new Promise((resolve, reject) => {
			watcher.on('event', evt => {
				if (evt.code === 'END') resolve();
				else if (evt.code === 'ERROR' || evt.code === 'FATAL') reject(evt.error);
			});
		}).catch(err => {
			assert.equal(err.message, 'STOP');
			assert.equal(warned, true);
		});
	});

	it('assigns chunk IDs before creating outputBundle chunks', () => {
		const chunks = [];
		return rollup
			.rollup({
				input: 'input',
				plugins: [
					loader({
						input: `export default [import('a'), import('b')];`,
						a: `import d from 'd'; import c from 'c'; export default () => c();`,
						b: `import c from 'c'; export default () => c();`,
						c: `export default () => console.log('c');`,
						d: `export default {};`
					}),
					{
						renderChunk(code, chunk, options) {
							chunks.push({
								fileName: chunk.fileName,
								imports: chunk.imports,
								modules: Object.keys(chunk.modules)
							});
						}
					}
				]
			})
			.then(bundle =>
				bundle.generate({
					entryFileNames: '[name].js',
					chunkFileNames: 'generated-[name].js',
					format: 'esm'
				})
			)
			.then(() => {
				assert.deepEqual(chunks, [
					{
						fileName: 'input.js',
						imports: [],
						modules: ['input']
					},
					{
						fileName: 'generated-chunk.js',
						imports: ['generated-chunk2.js'],
						modules: ['d', 'a']
					},
					{
						fileName: 'generated-chunk2.js',
						imports: [],
						modules: ['c']
					},
					{
						fileName: 'generated-chunk3.js',
						imports: ['generated-chunk2.js'],
						modules: ['b']
					}
				]);
			});
	});
});
