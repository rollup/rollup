const path = require('path');
const assert = require('assert');
const sander = require('sander');
const { loader } = require('../utils.js');
const rollup = require('../../dist/rollup.js');

const TEMP_DIR = path.join(__dirname, 'tmp');

describe('hooks', () => {
	it('allows to read and modify options in the options hook', () =>
		rollup
			.rollup({
				input: 'input',
				treeshake: false,
				plugins: [
					loader({ newInput: `alert('hello')` }),
					{
						buildStart(options) {
							assert.strictEqual(options.input, 'newInput');
							assert.strictEqual(options.treeshake, false);
						},
						options(options) {
							assert.strictEqual(options.input, 'input');
							assert.strictEqual(options.treeshake, false);
							assert.ok(/^\d+\.\d+\.\d+/.test(this.meta.rollupVersion));
							return Object.assign({}, options, { input: 'newInput' });
						}
					}
				]
			})
			.then(bundle => {}));

	it('allows to read and modify output options in the outputOptions hook', () =>
		rollup
			.rollup({
				input: 'input',
				treeshake: false,
				plugins: [
					loader({ input: `alert('hello')` }),
					{
						renderChunk(code, chunk, options) {
							assert.strictEqual(options.banner, 'new banner');
							assert.strictEqual(options.format, 'cjs');
						},
						outputOptions(options) {
							assert.strictEqual(options.banner, 'banner');
							assert.strictEqual(options.format, 'cjs');
							assert.ok(/^\d+\.\d+\.\d+/.test(this.meta.rollupVersion));
							return Object.assign({}, options, { banner: 'new banner' });
						}
					}
				]
			})
			.then(bundle =>
				bundle.generate({
					format: 'cjs',
					banner: 'banner'
				})
			)
			.then(({ output }) => {
				assert.equal(output[0].code, `new banner\n'use strict';\n\nalert('hello');\n`);
			}));

	it('allows to replace file with dir in the outputOptions hook', () =>
		rollup
			.rollup({
				input: 'input',
				treeshake: false,
				plugins: [
					loader({
						input: `console.log('input');import('other');`,
						other: `console.log('other');`
					}),
					{
						outputOptions(options) {
							const newOptions = Object.assign({}, options, {
								dir: TEMP_DIR,
								chunkFileNames: 'chunk.js'
							});
							delete newOptions.file;
							return newOptions;
						}
					}
				]
			})
			.then(bundle =>
				bundle.write({
					file: path.join(TEMP_DIR, 'bundle.js'),
					format: 'esm'
				})
			)
			.then(() => {
				const fileNames = sander.readdirSync(TEMP_DIR).sort();
				assert.deepStrictEqual(fileNames, ['chunk.js', 'input.js']);
				return sander.rimraf(TEMP_DIR);
			}));

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

	it('supports isExternal on plugin context', () =>
		rollup.rollup({
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
		}));

	it('supports resolveId on plugin context', () =>
		rollup
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
			.then(bundle => bundle.generate({ format: 'es' }))
			.then(({ output: [output] }) => {
				assert.equal(output.code, `alert('hello');\n`);
			}));

	it('passes bundle & output object to ongenerate & onwrite hooks, with deprecation warnings', () => {
		let deprecationCnt = 0;

		return rollup
			.rollup({
				input: 'input',
				onwarn(warning) {
					deprecationCnt++;
					if (deprecationCnt === 1) {
						assert.equal(warning.code, 'DEPRECATED_FEATURE');
						assert.equal(
							warning.message,
							'The "ongenerate" hook used by plugin at position 2 is deprecated. The "generateBundle" hook should be used instead.'
						);
					} else {
						assert.equal(warning.code, 'DEPRECATED_FEATURE');
						assert.equal(
							warning.message,
							'The "onwrite" hook used by plugin at position 2 is deprecated. The "generateBundle/writeBundle" hook should be used instead.'
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
			.then(bundle =>
				bundle.write({
					file: path.join(TEMP_DIR, 'bundle.js'),
					format: 'es'
				})
			)
			.then(() => {
				assert.equal(deprecationCnt, 2);
				return sander.rimraf(TEMP_DIR);
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
		const file = path.join(TEMP_DIR, 'bundle.js');

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
			.then(bundle =>
				bundle.write({
					file,
					format: 'cjs'
				})
			)
			.then(() => {
				assert.deepEqual(result, [{ a: file, format: 'cjs' }, { b: file, format: 'cjs' }]);
				return sander.rimraf(TEMP_DIR);
			});
	});

	it('caches chunk emission in transform hook', () => {
		let cache;
		return rollup
			.rollup({
				input: 'input',
				plugins: [
					loader({ input: '', chunk: "console.log('chunk');" }),
					{
						transform(code, id) {
							if (id === 'input') {
								return `export default import.meta.ROLLUP_CHUNK_URL_${this.emitChunk('chunk')};`;
							}
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
					`var input = new URL('chunk-01406d83.js', import.meta.url).href;\n\nexport default input;\n`
				);
				assert.equal(output[1].fileName, 'chunk-01406d83.js');
				assert.equal(output[1].code, `console.log('chunk');\n`);

				return rollup.rollup({
					cache,
					input: 'input',
					plugins: [
						loader({ input: '', chunk: "console.log('chunk');" }),
						{
							transform() {
								assert.fail('Should cache transform');
							}
						}
					]
				});
			})
			.then(bundle => {
				cache = bundle.cache;
				return bundle.generate({ format: 'es' });
			})
			.then(({ output }) => {
				assert.equal(
					output[0].code,
					`var input = new URL('chunk-01406d83.js', import.meta.url).href;\n\nexport default input;\n`
				);
				assert.equal(output[1].fileName, 'chunk-01406d83.js');
				assert.equal(output[1].code, `console.log('chunk');\n`);

				return rollup.rollup({
					cache,
					input: 'input',
					plugins: [
						loader({ input: '', chunk: "console.log('chunk');" }),
						{
							transform() {
								assert.fail('Should cache transform');
							}
						}
					]
				});
			})
			.then(bundle => bundle.generate({ format: 'es' }))
			.then(({ output }) => {
				assert.equal(
					output[0].code,
					`var input = new URL('chunk-01406d83.js', import.meta.url).href;\n\nexport default input;\n`
				);
				assert.equal(output[1].fileName, 'chunk-01406d83.js');
				assert.equal(output[1].code, `console.log('chunk');\n`);
			});
	});

	it('supports asset emission', () =>
		rollup
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
			.then(bundle => bundle.generate({ format: 'es' }))
			.then(({ output }) => {
				assert.equal(output[1].isAsset, true);
				assert.equal(output[1].fileName, 'assets/test-19916f7d.ext');
				assert.equal(output[1].source, 'hello world');
				assert.equal(output[0].fileName, 'input.js');
				assert.equal(output[0].isEntry, true);
				assert.equal(
					output[0].code,
					`var input = new URL('assets/test-19916f7d.ext', import.meta.url).href;\n\nexport default input;\n`
				);
			}));

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
					`var input = new URL('assets/test-19916f7d.ext', import.meta.url).href;\n\nexport default input;\n`
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
				cache = bundle.cache;
				return bundle.generate({ format: 'es' });
			})
			.then(({ output }) => {
				assert.equal(
					output[0].code,
					`var input = new URL('assets/test-19916f7d.ext', import.meta.url).href;\n\nexport default input;\n`
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
			.then(bundle => bundle.generate({ format: 'es' }))
			.then(({ output }) => {
				assert.equal(
					output[0].code,
					`var input = new URL('assets/test-19916f7d.ext', import.meta.url).href;\n\nexport default input;\n`
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
					`var input = new URL('assets/test-19916f7d.ext', import.meta.url).href;\n\nexport default input;\n`
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
			.then(bundle => bundle.generate({ format: 'es' }))
			.then(({ output }) => {
				assert.equal(runs, 2);
				assert.equal(output[0].code.trim(), `alert('hello world');`);
				assert.equal(output.length, 1);
			});
	});

	it('supports CommonJS asset urls', () =>
		rollup
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
			.then(bundle => bundle.generate({ format: 'cjs' }))
			.then(({ output: [{ code }] }) => {
				assert.equal(
					code,
					`'use strict';

var input = (typeof document === 'undefined' ? new (require('u' + 'rl').URL)('file:' + __dirname + '/assets/test-19916f7d.ext').href : new URL('assets/test-19916f7d.ext', document.currentScript && document.currentScript.src || document.baseURI).href);

module.exports = input;
`
				);
			}));

	it('supports custom asset file names', () =>
		rollup
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
			.then(bundle =>
				bundle.generate({
					format: 'es',
					assetFileNames: '[name][extname]'
				})
			)
			.then(({ output: [, output] }) => {
				assert.equal(output.fileName, 'test.ext');
				assert.equal(output.source, 'hello world');
			}));

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
			.then(bundle => bundle.generate({ format: 'es' }))
			.then(({ output: [, output] }) => {
				assert.equal(output.fileName, 'assets/test-19916f7d.ext');
				assert.equal(output.source, 'hello world');
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
			.then(bundle => bundle.generate({ format: 'es' }))
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
					assert.equal(warning.code, 'DEPRECATED_FEATURE');
					assert.equal(
						warning.message,
						'The "transformChunk" hook used by plugin at position 2 is deprecated. The "renderChunk" hook should be used instead.'
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
			.then(bundle =>
				bundle.generate({
					format: 'es',
					assetFileNames: '[name][extname]'
				})
			)
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
			.then(bundle =>
				bundle.generate({
					format: 'es',
					assetFileNames: '[name][extname]'
				})
			)
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
			.then(bundle =>
				bundle.generate({
					format: 'es',
					assetFileNames: '[name][extname]'
				})
			)
			.then(() => {
				assert.equal(calledHook, true);
			});
	});

	it('passes bundle object to generateBundle hook', () =>
		rollup
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
								`var input = new URL('assets/test-19916f7d.ext', import.meta.url).href;\n\nexport default input;\n`
							);
						}
					}
				]
			})
			.then(bundle => bundle.generate({ format: 'es' })));

	it('supports assets uniquely defined in the generateBundle hook', () =>
		rollup
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
			}));

	it('supports errors thrown in the generateBundle hook', () =>
		rollup
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
			.then(bundle => bundle.generate({ format: 'es' }))
			.catch(err => {
				assert.equal(err.message, 'test error');
			}));

	it('supports generateBundle hook including reporting rendered exports and source length', () =>
		rollup
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
			.then(bundle => bundle.generate({ format: 'es' })));

	it('supports writeBundle hook', () => {
		const file = path.join(TEMP_DIR, 'bundle.js');
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
			.then(() => {
				assert.strictEqual(callCount, 1);
				return sander.rimraf(TEMP_DIR);
			});
	});

	it('supports this.cache for plugins', () =>
		rollup
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
			.then(bundle =>
				rollup.rollup({
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
				})
			));

	it('throws for anonymous plugins using the cache', () =>
		rollup
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
			}));

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

	it('Allows plugins with any names using a shared cacheKey', () =>
		rollup.rollup({
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
		}));

	it('Evicts cache entries after cacheExpiry runs with no usage', () =>
		rollup
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
				for (let i = 0; i < 5; i++)
					promise = promise.then(() =>
						rollup.rollup({
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
						})
					);
				return promise;
			})
			.then(bundle =>
				rollup.rollup({
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
				})
			));

	it('Supports disabling the cache with cache: false', () =>
		rollup
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
			}));

	it('Disables the default transform cache when using cache in transform only', () =>
		rollup
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
			.then(bundle =>
				rollup.rollup({
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
				})
			)
			.then(bundle =>
				bundle.generate({
					format: 'es'
				})
			)
			.then(({ output }) => {
				assert.equal(output[0].code.trim(), `alert('hello');`);
			}));

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
			output: {
				format: 'esm'
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
			assert.equal(err.message, 'You must specify "output.file" or "output.dir" for the build.');
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
						fileName: 'generated-a.js',
						imports: ['generated-chunk.js'],
						modules: ['d', 'a']
					},
					{
						fileName: 'generated-chunk.js',
						imports: [],
						modules: ['c']
					},
					{
						fileName: 'generated-b.js',
						imports: ['generated-chunk.js'],
						modules: ['b']
					}
				]);
			});
	});
});
