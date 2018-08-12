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
						buildStart () {
							buildStartCnt++;
						},
						buildEnd () {
							buildEndCnt++;
						}
					}
				]
			})
			.then(bundle => {
				assert.equal(buildStartCnt, 1);
				assert.equal(buildEndCnt, 1);

				return rollup
					.rollup({
						input: 'input',
						plugins: [
							loader({ input: `invalid_source - @#$%^&*` }),
							{
								buildStart () {
									buildStartCnt++;
								},
								buildEnd () {
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
				onwarn (warning) {
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
						buildStart () {
							this.warn('build start');
						},
						buildEnd () {
							this.warn('build end');
						}
					}
				]
			})
			.then(() => {
				assert.equal(callCnt, 2);
			});
	});

	it('supports isExternal on plugin context', () => {
		return rollup
			.rollup({
				input: 'input',
				external: ['test'],
				plugins: [
					loader({ input: `alert('hello')` }),
					{
						buildStart () {
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
						resolveId (id) {
							if (id === 'test')
								return 'dep1';
							if (id === 'next')
								return this.resolveId('final');
							if (id === 'final')
								return 'dep2';
						}
					}
				]
			})
			.then(bundle => {
				return bundle.generate({ format: 'es' });
			})
			.then(output => {
				assert.equal(output.code, `alert('hello');\n`);
			});
	});

	it('passes bundle & output object to ongenerate & onwrite hooks', () => {
		const file = path.join(__dirname, 'tmp/bundle.js');

		return rollup
			.rollup({
				input: 'input',
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
				experimentalCodeSplitting: true,
				plugins: [
					loader({ input: '' }),
					{
						transform () {
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
				assert.equal(output['assets/test-19916f7d.ext'], 'hello world');
				assert.equal(output['input.js'].code, `var input = new URL('../assets/test-19916f7d.ext', import.meta.url).href;\n\nexport default input;\n`);
			});
	});

	it('caches asset emission in transform hook', () => {
		let cache;
		return rollup
			.rollup({
				input: 'input',
				experimentalCodeSplitting: true,
				plugins: [
					loader({ input: '' }),
					{
						transform () {
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
				assert.equal(output['assets/test-19916f7d.ext'], 'hello world');
				assert.equal(output['input.js'].code, `var input = new URL('../assets/test-19916f7d.ext', import.meta.url).href;\n\nexport default input;\n`);

				return rollup
				.rollup({
					cache,
					input: 'input',
					experimentalCodeSplitting: true,
					plugins: [
						loader({ input: '' }),
						{
							transform () {
								assert.fail('Should cache transform');
							}
						}
					]
				})
			})
			.then(bundle => {
				return bundle.generate({ format: 'es' });
			})
			.then(({ output }) => {
				assert.equal(output['assets/test-19916f7d.ext'], 'hello world');
				assert.equal(output['input.js'].code, `var input = new URL('../assets/test-19916f7d.ext', import.meta.url).href;\n\nexport default input;\n`);
			});
	});

	it('opts-out transform hook cache for custom cache', () => {
		let runs = 0;
		let cache;
		return rollup
			.rollup({
				input: 'input',
				experimentalCodeSplitting: true,
				plugins: [
					loader({ input: '' }),
					{
						name: 'x',
						transform () {
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
				assert.equal(output['assets/test-19916f7d.ext'], 'hello world');
				assert.equal(output['input.js'].code, `var input = new URL('../assets/test-19916f7d.ext', import.meta.url).href;\n\nexport default input;\n`);

				return rollup
				.rollup({
					cache,
					input: 'input',
					experimentalCodeSplitting: true,
					plugins: [
						loader({ input: '' }),
						{
							name: 'x',
							transform () {
								runs++;
								return `alert('hello world')`;
							}
						}
					]
				})
			})
			.then(bundle => {
				return bundle.generate({ format: 'es' });
			})
			.then(({ output }) => {
				assert.equal(runs, 2);
				assert.equal(output['assets/test-19916f7d.ext'], undefined);
				assert.equal(output['input.js'].code.trim(), `alert('hello world');`);
			});
	});

	it('supports CommonJS asset urls', () => {
		return rollup
			.rollup({
				input: 'input',
				experimentalCodeSplitting: true,
				plugins: [
					loader({ input: '' }),
					{
						transform () {
							const assetId = this.emitAsset('test.ext', 'hello world');
							return `export default import.meta.ROLLUP_ASSET_URL_${assetId};`;
						}
					}
				]
			})
			.then(bundle => {
				return bundle.generate({ format: 'cjs' });
			})
			.then(({ output }) => {
				assert.equal(output['input.js'].code, `'use strict';

var input = new (typeof URL !== 'undefined' ? URL : require('ur'+'l').URL)((process.browser ? '' : 'file:') + __dirname + '/assets/test-19916f7d.ext', process.browser && document.baseURI).href;

module.exports = input;
`);
			});
	});

	it('supports custom asset file names', () => {
		return rollup
			.rollup({
				input: 'input',
				experimentalCodeSplitting: true,
				plugins: [
					loader({ input: `alert('hello')` }),
					{
						transform () {
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
			.then(({ output }) => {
				assert.equal(output['test.ext'], 'hello world');
			});
	});

	it('allows setting asset source separately', () => {
		let assetId;
		return rollup
			.rollup({
				input: 'input',
				experimentalCodeSplitting: true,
				plugins: [
					loader({ input: `alert('hello')` }),
					{
						transform () {
							assetId = this.emitAsset('test.ext');
							return '';
						},
						generateBundle () {
							this.setAssetSource(assetId, 'hello world');
						}
					}
				]
			})
			.then(bundle => {
				return bundle.generate({ format: 'es' });
			})
			.then(({ output }) => {
				assert.equal(output['assets/test-19916f7d.ext'], 'hello world');
			});
	});

	it('throws when calling setAssetSource in transform', () => {
		return rollup
			.rollup({
				input: 'input',
				experimentalCodeSplitting: true,
				plugins: [
					loader({ input: `alert('hello')` }),
					{
						transform () {
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
				experimentalCodeSplitting: true,
				plugins: [
					loader({ input: `alert('hello')` }),
					{
						buildEnd () {
							const assetId = this.emitAsset('test.ext');
							this.setAssetSource(assetId, 'hello world');
							try {
								this.setAssetSource(assetId, 'another');
							}
							catch (e) {
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
			.then(({ output }) => {
				assert.equal(output['assets/test-19916f7d.ext'], 'hello world');
				assert.equal(thrown, true);
			});
	});

	it('allows setting asset source at generateBundle', () => {
		let assetId;
		return rollup
			.rollup({
				input: 'input',
				experimentalCodeSplitting: true,
				plugins: [
					loader({ input: `alert('hello')` }),
					{
						transform () {
							return '';
						},
						generateBundle () {
							assetId = this.emitAsset('test.ext');
							this.setAssetSource(assetId, 'hello world');
						}
					}
				]
			})
			.then(bundle => {
				return bundle.generate({ format: 'es' });
			})
			.then(({ output }) => {
				assert.equal(output['assets/test-19916f7d.ext'], 'hello world');
			});
	});

	it('throws when emitting assets too late', () => {
		let calledHook = false;
		return rollup
			.rollup({
				input: 'input',
				experimentalCodeSplitting: true,
				plugins: [
					loader({ input: `alert('hello')` }),
					{
						generateBundle (code, id) {
							try {
								this.emitAsset('test.ext', [], 'hello world');
							}
							catch (e) {
								assert.equal(e.code, 'ASSETS_FINALISED');
								calledHook = true;
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

	it('throws when calling setAssetSource from transform', () => {
		let calledHook = false;
		return rollup
			.rollup({
				input: 'input',
				experimentalCodeSplitting: true,
				plugins: [
					loader({ input: `alert('hello')` }),
					{
						generateBundle (code, id) {
							try {
								this.emitAsset('test.ext', [], 'hello world');
							}
							catch (e) {
								assert.equal(e.code, 'ASSETS_FINALISED');
								calledHook = true;
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

	it('supports transformChunk in place of transformBundle', () => {
		let calledHook = false;
		return rollup
			.rollup({
				input: 'input',
				experimentalCodeSplitting: true,
				plugins: [
					loader({ input: `alert('hello')` }),
					{
						transformChunk (code, id) {
							calledHook = true;
							try {
								this.emitAsset('test.ext', 'hello world');
							}
							catch (e) {
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
				experimentalCodeSplitting: true,
				plugins: [
					loader({ input: `alert('hello')` }),
					{
						transform () {
							const assetId = this.emitAsset('test.ext', 'hello world');
							return `export default import.meta.ROLLUP_ASSET_URL_${assetId};`;
						},
						generateBundle (options, outputBundle, isWrite) {
							assert.equal(outputBundle['assets/test-19916f7d.ext'], 'hello world');
							assert.equal(outputBundle['input.js'].code, `var input = new URL('../assets/test-19916f7d.ext', import.meta.url).href;\n\nexport default input;\n`);
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
				experimentalCodeSplitting: true,
				plugins: [
					loader({ input: `alert('hello')` }),
					{
						generateBundle (options) {
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
				bundle.generate({ format: 'es' })
					.then(outputBundle1 =>
						bundle.generate({ format: 'cjs' })
							.then(outputBundle2 => [outputBundle1, outputBundle2])
					)
			)
			.then(([{ output: output1 }, { output: output2 }]) => {
				assert.equal(output1['input.js'].code, `alert('hello');\n`);
				assert.equal(output1['assets/lateDepAsset-671f747d'], `custom source`);
				assert.equal(output1['assets/lateMainAsset-863ea4b5'], `references assets/lateDepAsset-671f747d`);

				assert.equal(output2['input.js'].code, `'use strict';\n\nalert('hello');\n`);
				assert.equal(output2['assets/lateDepAsset-671f747d'], undefined);
				assert.equal(output2['assets/lateMainAsset-863ea4b5'], undefined);
				assert.equal(output2['assets/lateDepAsset-c107f5fc'], `different source`);
				assert.equal(output2['assets/lateMainAsset-6dc2262b'], `references assets/lateDepAsset-c107f5fc`);
			});
	});

	it('supports errors thrown in the generateBundle hook', () => {
		return rollup
			.rollup({
				input: 'input',
				experimentalCodeSplitting: true,
				plugins: [
					loader({ input: `alert('hello')` }),
					{
						generateBundle () {
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


	it('supports processBundle hook including reporting rendered exports and source length', () => {
		return rollup
			.rollup({
				input: 'input',
				experimentalCodeSplitting: true,
				plugins: [
					loader({
						input: `export { a as default } from 'dep';`,
						dep: `export var a = 1; export var b = 2;`
					}),
					{
						generateBundle (options, outputBundle, isWrite) {
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
			.then(bundle => {
				return bundle.generate({ format: 'es' });
			});
	});

	it('supports this.cache for plugins', () => {
		return rollup
			.rollup({
				input: 'input',
				plugins: [
					loader({ input: `alert('hello')` }),
					{
						name: 'cachePlugin',
						buildStart () {
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
							buildStart () {
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
						buildStart () {
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
				return rollup.rollup({
					input: 'input',
					plugins: [
						loader({ input: `alert('hello')` }),
						{
							name: 'a',
							buildStart () {
								this.cache.set('asdf', 'asdf');
							}
						},
						{
							name: 'a',
							buildStart () {
								this.cache.set('asdf', 'asdf');
							}
						}
					]
				})
				.catch(err => {
					assert.equal(err.code, 'PLUGIN_ERROR');
					assert.equal(err.pluginCode, 'DUPLICATE_PLUGIN_NAME');
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
					buildStart () {
						this.cache.set('asdf', 'asdf');
					}
				},
				{
					name: 'a',
					cacheKey: 'a9b6',
					buildEnd () {
						assert.equal(this.cache.get('asdf'), 'asdf');
					}
				},
				{
					name: 'b',
					cacheKey: 'a9b6',
					buildEnd () {
						assert.equal(this.cache.get('asdf'), 'asdf');
					}
				}
			]
		})
	});

	it('Evicts cache entries after cacheExpiry runs with no usage', () => {
		return rollup.rollup({
			input: 'input',
			cacheExpiry: 5,
			plugins: [
				loader({ input: `alert('hello')` }),
				{
					name: 'x',
					buildStart () {
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
						cacheExpiry: 5,
						plugins: [
							loader({ input: `alert('hello')` }),
							{
								name: 'x',
								buildStart () {
									if (i === 4)
										assert.equal(this.cache.has('second'), true);
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
				cacheExpiry: 5,
				plugins: [
					loader({ input: `alert('hello')` }),
					{
						name: 'x',
						buildStart () {
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
		return rollup.rollup({
			input: 'input',
			cache: false,
			plugins: [
				loader({ input: `alert('hello')` }),
				{
					name: 'x',
					buildStart () {
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
		return rollup.rollup({
			input: 'input',
			plugins: [
				loader({ input: `alert('hello')` }),
				{
					name: 'x',
					transform () {
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
						transform () {
							assert.equal(this.cache.get('asdf'), 'asdf');
							return `alert('hello')`;
						}
					}
				]
			})
		})
		.then(bundle => {
			return bundle.generate({
				format: 'es'
			});
		})
		.then(bundle => {
			assert.equal(bundle.code.trim(), `alert('hello');`);
		});
	});
});