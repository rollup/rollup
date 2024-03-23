const assert = require('node:assert');
const path = require('node:path');
const { outputFile, readdir, remove } = require('fs-extra');
/**
 * @type {import("../../src/rollup/types")} Rollup
 */
const rollup = require('../../dist/rollup.js');
const { loader, wait } = require('../utils.js');

const TEMP_DIR = path.join(__dirname, 'tmp');

describe('hooks', () => {
	before(() => remove(TEMP_DIR));

	it('allows to replace file with dir in the outputOptions hook', async () => {
		const bundle = await rollup.rollup({
			input: 'input',
			treeshake: false,
			plugins: [
				loader({
					input: `console.log('input');import('other');`,
					other: `console.log('other');`
				}),
				{
					outputOptions(options) {
						const newOptions = { ...options, dir: TEMP_DIR, chunkFileNames: 'chunk.js' };
						delete newOptions.file;
						return newOptions;
					}
				}
			]
		});
		await bundle.write({
			file: path.join(TEMP_DIR, 'bundle.js'),
			format: 'es'
		});
		const fileNames = (await readdir(TEMP_DIR)).sort();
		await remove(TEMP_DIR);
		assert.deepStrictEqual(fileNames, ['chunk.js', 'input.js']);
	});

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
			.then(() => {
				assert.strictEqual(buildStartCnt, 1);
				assert.strictEqual(buildEndCnt, 1);

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
			.catch(error => {
				assert.ok(error);
			})
			.then(() => {
				assert.strictEqual(buildStartCnt, 2);
				assert.strictEqual(buildEndCnt, 2);
			});
	});

	it('supports warnings in buildStart and buildEnd hooks', () => {
		let callCnt = 0;
		return rollup
			.rollup({
				input: 'input',
				onwarn(warning) {
					if (callCnt === 0) {
						assert.strictEqual(warning.message, '[plugin at position 2] build start');
						callCnt++;
					} else if (callCnt === 1) {
						assert.strictEqual(warning.message, '[plugin at position 2] build end');
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
				assert.strictEqual(callCnt, 2);
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
							assert.strictEqual(error.message, '[plugin at position 2] build start error');
							handledError = true;
						}
					}
				]
			})
			.catch(error => {
				assert.ok(handledError);
				assert.strictEqual(error.message, '[plugin at position 2] build start error');
			})
			.then(() => {
				assert.ok(handledError);
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
								return `export default import.meta.ROLLUP_FILE_URL_${this.emitFile({
									type: 'chunk',
									id: 'chunk'
								})};`;
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
				assert.strictEqual(
					output[0].code,
					`var input = new URL('chunk-CnTfOX_8.js', import.meta.url).href;\n\nexport { input as default };\n`
				);
				assert.strictEqual(output[1].fileName, 'chunk-CnTfOX_8.js');
				assert.strictEqual(output[1].code, `console.log('chunk');\n`);

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
				assert.strictEqual(
					output[0].code,
					`var input = new URL('chunk-CnTfOX_8.js', import.meta.url).href;\n\nexport { input as default };\n`
				);
				assert.strictEqual(output[1].fileName, 'chunk-CnTfOX_8.js');
				assert.strictEqual(output[1].code, `console.log('chunk');\n`);

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
				assert.strictEqual(
					output[0].code,
					`var input = new URL('chunk-CnTfOX_8.js', import.meta.url).href;\n\nexport { input as default };\n`
				);
				assert.strictEqual(output[1].fileName, 'chunk-CnTfOX_8.js');
				assert.strictEqual(output[1].code, `console.log('chunk');\n`);
			});
	});

	it('does not overwrite files in other outputs when emitting assets during generate', () =>
		rollup
			.rollup({
				input: 'input',
				plugins: [
					loader({ input: 'export default 42;' }),
					{
						generateBundle(outputOptions) {
							this.emitFile({ type: 'asset', source: outputOptions.format });
						}
					}
				]
			})
			.then(bundle =>
				Promise.all([
					bundle.generate({ format: 'es', assetFileNames: 'asset' }),
					bundle.generate({ format: 'cjs', assetFileNames: 'asset', exports: 'auto' })
				])
			)
			.then(([{ output: output1 }, { output: output2 }]) => {
				assert.strictEqual(output1.length, 2, 'output1');
				assert.strictEqual(output1[1].fileName, 'asset');
				assert.strictEqual(output1[1].source, 'es');
				assert.strictEqual(output2.length, 2, 'output2');
				assert.strictEqual(output2[1].fileName, 'asset');
				assert.strictEqual(output2[1].source, 'cjs');
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
							return `export default import.meta.ROLLUP_FILE_URL_${this.emitFile({
								type: 'asset',
								name: 'test.ext',
								source: 'hello world'
							})};`;
						}
					}
				]
			})
			.then(bundle => {
				cache = bundle.cache;
				return bundle.generate({ format: 'es' });
			})
			.then(({ output }) => {
				assert.strictEqual(
					output[0].code,
					`var input = new URL('assets/test-DHthXMdY.ext', import.meta.url).href;\n\nexport { input as default };\n`
				);
				assert.strictEqual(output[1].fileName, 'assets/test-DHthXMdY.ext');
				assert.strictEqual(output[1].source, 'hello world');

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
				assert.strictEqual(
					output[0].code,
					`var input = new URL('assets/test-DHthXMdY.ext', import.meta.url).href;\n\nexport { input as default };\n`
				);
				assert.strictEqual(output[1].fileName, 'assets/test-DHthXMdY.ext');
				assert.strictEqual(output[1].source, 'hello world');

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
				assert.strictEqual(
					output[0].code,
					`var input = new URL('assets/test-DHthXMdY.ext', import.meta.url).href;\n\nexport { input as default };\n`
				);
				assert.strictEqual(output[1].fileName, 'assets/test-DHthXMdY.ext');
				assert.strictEqual(output[1].source, 'hello world');
			});
	});

	it('keeps emitted ids stable between runs', () => {
		let cache;
		let emittedFile;
		return rollup
			.rollup({
				input: 'input',
				plugins: [
					{
						resolveId(id) {
							return id;
						},
						load(id) {
							if (id === 'input') {
								return '';
							}
							this.setAssetSource(emittedFile, 'first run');
							return `console.log('imported')`;
						},
						transform(code, id) {
							if (id === 'input') {
								emittedFile = this.emitFile({
									type: 'asset',
									name: 'test.ext'
								});
								return (
									`import 'imported';\n` +
									`export default import.meta.ROLLUP_FILE_URL_${emittedFile};`
								);
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
				assert.strictEqual(
					output[0].code,
					`console.log('imported');\n\n` +
						`var input = new URL('assets/test-D4aMR-gt.ext', import.meta.url).href;\n\n` +
						`export { input as default };\n`
				);
				assert.strictEqual(output[1].fileName, 'assets/test-D4aMR-gt.ext');
				assert.strictEqual(output[1].source, 'first run');

				return rollup.rollup({
					cache,
					input: 'input',
					plugins: [
						{
							resolveId(id) {
								return id;
							},
							load(id) {
								if (id === 'input') {
									return '';
								}
								this.setAssetSource(emittedFile, 'second run');
								return `console.log('imported')`;
							},
							transform() {
								assert.fail('Should cache transform');
							}
						}
					]
				});
			})
			.then(bundle => bundle.generate({ format: 'es' }))
			.then(({ output }) => {
				assert.strictEqual(
					output[0].code,
					`console.log('imported');\n\n` +
						`var input = new URL('assets/test-D40n34Dy.ext', import.meta.url).href;\n\n` +
						`export { input as default };\n`
				);
				assert.strictEqual(output[1].fileName, 'assets/test-D40n34Dy.ext');
				assert.strictEqual(output[1].source, 'second run');
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
							const assetId = this.emitFile({
								type: 'asset',
								name: 'test.ext',
								source: 'hello world'
							});
							return `export default import.meta.ROLLUP_FILE_URL_${assetId};`;
						}
					}
				]
			})
			.then(bundle => {
				cache = bundle.cache;
				return bundle.generate({ format: 'es' });
			})
			.then(({ output }) => {
				assert.strictEqual(
					output[0].code,
					`var input = new URL('assets/test-DHthXMdY.ext', import.meta.url).href;\n\nexport { input as default };\n`
				);
				assert.strictEqual(output[1].fileName, 'assets/test-DHthXMdY.ext');
				assert.strictEqual(output[1].source, 'hello world');
				assert.strictEqual(output[1].fileName, 'assets/test-DHthXMdY.ext');
				assert.strictEqual(output[1].source, 'hello world');

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
				assert.strictEqual(runs, 2);
				assert.strictEqual(output[0].code.trim(), `alert('hello world');`);
				assert.strictEqual(output.length, 1);
			});
	});

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
							assert.strictEqual(chunk.modules.dep.renderedExports[0], 'a');
							assert.strictEqual(chunk.modules.dep.renderedExports.length, 1);

							assert.strictEqual(chunk.modules.dep.removedExports[0], 'b');
							assert.strictEqual(chunk.modules.dep.removedExports.length, 1);

							assert.strictEqual(chunk.modules.dep.renderedLength, 10);
							assert.strictEqual(chunk.modules.dep.originalLength, 35);
						}
					}
				]
			})
			.then(bundle => bundle.generate({ format: 'es' })));

	it('supports writeBundle hook', async () => {
		const file = path.join(TEMP_DIR, 'bundle.js');
		let generatedBundle;
		let callCount = 0;
		const bundle = await rollup.rollup({
			input: 'input',
			plugins: [
				loader({
					input: `export { a as default } from 'dep';`,
					dep: `export var a = 1; export var b = 2;`
				}),
				{
					generateBundle(options, outputBundle, isWrite) {
						generatedBundle = outputBundle;
						assert.strictEqual(isWrite, true);
					}
				},
				{
					writeBundle(options, outputBundle) {
						assert.deepStrictEqual(options.file, file);
						assert.deepStrictEqual(outputBundle, generatedBundle);
						callCount++;
					}
				}
			]
		});
		await bundle.write({ format: 'es', file });
		await remove(TEMP_DIR);
		assert.strictEqual(callCount, 1);
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
								assert.strictEqual(this.cache.get('asdf'), 'asdf');
								assert.strictEqual(this.cache.delete('asdf'), true);
								assert.ok(!this.cache.has('asdf'));
							}
						}
					]
				})
			));

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
						assert.strictEqual(this.cache.get('asdf'), 'asdf');
					}
				},
				{
					name: 'b',
					cacheKey: 'a9b6',
					buildEnd() {
						assert.strictEqual(this.cache.get('asdf'), 'asdf');
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
				for (let index = 0; index < 5; index++)
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
										if (index === 4) assert.strictEqual(this.cache.has('second'), true);
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
								assert.strictEqual(this.cache.has('first'), false);
								assert.strictEqual(this.cache.get('first'), undefined);
								assert.strictEqual(this.cache.get('second'), 'second');
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
							assert.ok(!this.cache.has('x'));
							assert.strictEqual(this.cache.get('x'), undefined);
							this.cache.delete('x');
						}
					}
				]
			})
			.then(bundle => {
				assert.strictEqual(bundle.cache, undefined);
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
					},
					{
						name: 'y',
						transform(code) {
							return code + `;alert('world')`;
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
								assert.ok(this.cache.has('asdf'));
								assert.strictEqual(this.cache.get('asdf'), 'asdf');
								this.cache.delete('asdf');
								assert.ok(!this.cache.has('asdf'));
								return `alert('hello')`;
							}
						},
						{
							name: 'y',
							transform(code) {
								return code + `;alert('world')`;
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
				assert.strictEqual(output[0].code.trim(), `alert('hello');alert('world');`);
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
							assert.strictEqual(generateBundleCount, 0);
							assert.strictEqual(renderErrorCount, 0);
						},
						generateBundle() {
							generateBundleCount++;
							assert.strictEqual(renderStartCount, 1);
							assert.strictEqual(renderErrorCount, 0);
						},
						renderError() {
							renderErrorCount++;
						}
					}
				]
			})
			.then(bundle => bundle.generate({ format: 'es' }))
			.then(() => {
				assert.strictEqual(renderStartCount, 1, 'renderStart count');
				assert.strictEqual(generateBundleCount, 1, 'generateBundle count');
				assert.strictEqual(renderErrorCount, 0, 'renderError count');
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
							throw new Error('renderChunk error');
						},
						generateBundle() {
							generateBundleCount++;
						},
						renderError(error) {
							assert(error);
							assert.strictEqual(error.message, 'renderChunk error');
							assert.strictEqual(renderStartCount, 1);
							renderErrorCount++;
						}
					}
				]
			})
			.then(bundle => bundle.generate({ format: 'es' }))
			.catch(error => {
				assert.ok(error);
			})
			.then(() => {
				assert.strictEqual(renderStartCount, 1, 'renderStart count');
				assert.strictEqual(generateBundleCount, 0, 'generateBundle count');
				assert.strictEqual(renderErrorCount, 1, 'renderError count');
			});
	});

	it('Throws when not specifying "file" or "dir"', () => {
		const watcher = rollup.watch({
			input: 'input',
			output: {
				format: 'es'
			},
			plugins: [loader({ input: `alert('hello')` })]
		});
		return new Promise((resolve, reject) => {
			watcher.on('event', event => {
				if (event.code === 'BUNDLE_END') reject(new Error('Expected an error'));
				else if (event.code === 'ERROR') reject(event.error);
			});
		})
			.catch(error => {
				watcher.close();
				assert.strictEqual(
					error.message,
					'You must specify "output.file" or "output.dir" for the build.'
				);
			})
			.then(() => watcher.close());
	});

	it('Throws when using the "file"" option for multiple chunks', () => {
		const watcher = rollup.watch({
			input: 'input',
			output: {
				format: 'es',
				file: 'bundle.js'
			},
			plugins: [loader({ input: `import('dep')`, dep: `console.log('dep')` })]
		});
		return new Promise((resolve, reject) => {
			watcher.on('event', event => {
				if (event.code === 'BUNDLE_END') reject(new Error('Expected an error'));
				else if (event.code === 'ERROR') reject(event.error);
			});
		})
			.catch(error => {
				watcher.close();
				assert.strictEqual(
					error.message,
					'Invalid value for option "output.file" - when building multiple chunks, the "output.dir" option must be used, not "output.file". To inline dynamic imports, set the "inlineDynamicImports" option.'
				);
			})
			.then(() => watcher.close());
	});

	it('Throws when using the "sourcemapFile" option for multiple chunks', () => {
		const watcher = rollup.watch({
			input: 'input',
			output: {
				format: 'es',
				sourcemapFile: 'bundle.map',
				dir: 'ignored'
			},
			plugins: [loader({ input: `import('dep')`, dep: `console.log('dep')` })]
		});
		return new Promise((resolve, reject) => {
			watcher.on('event', event => {
				if (event.code === 'BUNDLE_END') reject(new Error('Expected an error'));
				else if (event.code === 'ERROR') reject(event.error);
			});
		})
			.catch(error => {
				watcher.close();
				assert.strictEqual(
					error.message,
					'Invalid value for option "output.sourcemapFile" - "output.sourcemapFile" is only supported for single-file builds.'
				);
			})
			.then(() => watcher.close());
	});

	it('assigns chunk IDs before creating outputBundle chunks', () => {
		const chunks = [];
		return rollup
			.rollup({
				input: 'input',
				plugins: [
					loader({
						input: `export default [import('a'), import('b')];`,
						a: `import d from 'd'; import c from 'c'; export default () => c(d);`,
						b: `import c from 'c'; export default () => c(0);`,
						c: `export default (x) => console.log('c', x);`,
						d: `export default {};`
					}),
					{
						renderChunk(code, chunk) {
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
					format: 'es'
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
						imports: ['generated-c.js'],
						modules: ['d', 'a']
					},
					{
						fileName: 'generated-b.js',
						imports: ['generated-c.js'],
						modules: ['b']
					},
					{
						fileName: 'generated-c.js',
						imports: [],
						modules: ['c']
					}
				]);
			});
	});

	it('supports augmentChunkHash hook', () => {
		let augmentChunkHashCalls = 0;
		return rollup
			.rollup({
				input: 'input',
				plugins: [
					loader({
						input: `alert('hello')`
					}),
					{
						augmentChunkHash() {
							augmentChunkHashCalls++;
							assert(this.meta);
							assert(this.meta.rollupVersion);
						}
					}
				]
			})
			.then(bundle =>
				bundle.generate({
					format: 'es',
					dir: 'dist',
					entryFileNames: '[name]-[hash].js'
				})
			)
			.then(() => {
				assert.strictEqual(augmentChunkHashCalls, 1);
			});
	});

	it('supports closeBundle hook', () => {
		let closeBundleCalls = 0;
		return rollup
			.rollup({
				input: 'input',
				plugins: [
					loader({ input: `alert('hello')` }),
					{
						closeBundle() {
							closeBundleCalls++;
						}
					}
				]
			})
			.then(bundle => bundle.close())
			.then(() => {
				assert.strictEqual(closeBundleCalls, 1);
			});
	});

	it('calls closeBundle hook on build error', () => {
		let closeBundleCalls = 0;
		return rollup
			.rollup({
				input: 'input',
				plugins: [
					loader({ input: `alert('hello')` }),
					{
						buildStart() {
							this.error('build start error');
						},
						closeBundle() {
							closeBundleCalls++;
						}
					}
				]
			})
			.catch(() => {
				assert.strictEqual(closeBundleCalls, 1);
			});
	});

	it('passes errors from closeBundle hook', () => {
		let handledError = false;
		return rollup
			.rollup({
				input: 'input',
				plugins: [
					loader({ input: `alert('hello')` }),
					{
						closeBundle() {
							this.error('close bundle error');
						}
					}
				]
			})
			.then(bundle => bundle.close())
			.catch(error => {
				assert.strictEqual(error.message, '[plugin at position 2] close bundle error');
				handledError = true;
			})
			.then(() => {
				assert.ok(handledError);
			});
	});

	it('supports disabling sanitization for in-memory / in-browser / non-fs builds', () =>
		rollup
			.rollup({
				input: 'input.js',
				plugins: [
					{
						resolveId: id => id,
						load: () => `export default 5`
					}
				]
			})
			.then(bundle =>
				bundle.generate({
					format: 'es',
					sanitizeFileName: false,
					entryFileNames: 'test:[name]'
				})
			)
			.then(({ output }) => {
				assert.strictEqual(output[0].fileName, 'test:input');
			}));

	it('allows to enforce plugin hook order in watch mode', async () => {
		const hooks = ['closeBundle', 'closeWatcher', 'renderError', 'watchChange', 'writeBundle'];

		const calledHooks = {};
		for (const hook of hooks) {
			calledHooks[hook] = [];
		}

		let first = true;
		const plugins = [
			{
				name: 'render-error',
				renderChunk() {
					if (first) {
						first = false;
						throw new Error('Expected render error');
					}
				}
			}
		];
		addPlugin(null);
		addPlugin('pre');
		addPlugin('post');
		addPlugin('post');
		addPlugin('pre');
		addPlugin();

		function addPlugin(order) {
			const name = `${order}-${plugins.length}`;
			const plugin = { name };
			for (const hook of hooks) {
				plugin[hook] = {
					order,
					handler() {
						if (!calledHooks[hook].includes(name)) {
							calledHooks[hook].push(name);
						}
					}
				};
			}
			plugins.push(plugin);
		}

		const ID_MAIN = path.join(TEMP_DIR, 'main.js');
		await outputFile(ID_MAIN, 'console.log(42);');
		await wait(100);

		const watcher = rollup.watch({
			input: ID_MAIN,
			output: {
				format: 'es',
				dir: path.join(TEMP_DIR, 'out')
			},
			plugins
		});

		return new Promise((resolve, reject) => {
			watcher.on('event', async event => {
				if (event.code === 'ERROR') {
					if (event.error.message !== 'Expected render error') {
						reject(event.error);
					}
					await wait(300);
					await outputFile(ID_MAIN, 'console.log(43);');
				} else if (event.code === 'BUNDLE_END') {
					await event.result.close();
					resolve();
				}
			});
		}).finally(async () => {
			await watcher.close();
			await remove(TEMP_DIR);
			for (const hook of hooks) {
				assert.deepStrictEqual(
					calledHooks[hook],
					['pre-2', 'pre-5', 'null-1', 'undefined-6', 'post-3', 'post-4'],
					hook
				);
			}
		});
	});

	it('allows to enforce sequential plugin hook order in watch mode', async () => {
		const hooks = ['closeBundle', 'closeWatcher', 'renderError', 'watchChange', 'writeBundle'];

		const calledHooks = {};
		const activeHooks = {};
		for (const hook of hooks) {
			calledHooks[hook] = [];
			activeHooks[hook] = new Set();
		}

		let first = true;
		const plugins = [
			{
				name: 'render-error',
				renderChunk() {
					if (first) {
						first = false;
						throw new Error('Expected render error');
					}
				}
			}
		];
		addPlugin(null, true);
		addPlugin('pre', false);
		addPlugin('post', false);
		addPlugin('post', false);
		addPlugin('pre', false);
		addPlugin(undefined, true);
		addPlugin(null, false);
		addPlugin('pre', true);
		addPlugin('post', true);
		addPlugin('post', true);
		addPlugin('pre', true);
		addPlugin(undefined, false);

		function addPlugin(order, sequential) {
			const name = `${order}-${sequential ? 'seq-' : ''}${plugins.length}`;
			const plugin = { name };
			for (const hook of hooks) {
				plugin[hook] = {
					order,
					async handler() {
						const active = activeHooks[hook];
						if (!calledHooks[hook].includes(name)) {
							calledHooks[hook].push(sequential ? name : [name, [...active]]);
						}
						if (sequential && active.size > 0) {
							throw new Error(`Detected parallel hook runs in ${hook}.`);
						}
						active.add(name);
						// A setTimeout always takes longer than any chain of immediately
						// resolved promises
						await wait(0);
						active.delete(name);
					},
					sequential
				};
			}
			plugins.push(plugin);
		}

		const ID_MAIN = path.join(TEMP_DIR, 'main.js');
		await outputFile(ID_MAIN, 'console.log(42);');
		await wait(100);

		const watcher = rollup.watch({
			input: ID_MAIN,
			output: {
				format: 'es',
				dir: path.join(TEMP_DIR, 'out')
			},
			plugins
		});

		return new Promise((resolve, reject) => {
			watcher.on('event', async event => {
				if (event.code === 'ERROR') {
					if (event.error.message !== 'Expected render error') {
						reject(event.error);
					}
					await wait(300);
					await outputFile(ID_MAIN, 'console.log(43);');
				} else if (event.code === 'BUNDLE_END') {
					await event.result.close();
					resolve();
				}
			});
		}).finally(async () => {
			await watcher.close();
			await remove(TEMP_DIR);
			for (const hook of hooks) {
				assert.deepStrictEqual(
					calledHooks[hook],
					[
						['pre-2', []],
						['pre-5', ['pre-2']],
						'pre-seq-8',
						'pre-seq-11',
						'null-seq-1',
						'undefined-seq-6',
						['null-7', []],
						['undefined-12', ['null-7']],
						['post-3', ['null-7', 'undefined-12']],
						['post-4', ['null-7', 'undefined-12', 'post-3']],
						'post-seq-9',
						'post-seq-10'
					],
					hook
				);
			}
		});
	});
});
