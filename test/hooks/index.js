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
				})
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
		let callCnt = 0;
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
		let callCnt = 0;
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
						resolveId (id, parent) {
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
								result.push({ a: info.file, format: info.format });
								fulfil();
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

	it('calls missingExport hook', () => {
		let wasCalled;

		return rollup
			.rollup({
				input: 'main',
				plugins: [
					loader({
						main: `import def from 'foo'; console.log( def );`,
						foo: `export const named = 42;`
					}),
					{
						missingExport() {
							wasCalled = true;
							return true;
						}
					}
				]
			})
			.then(() => {
				assert.ok(wasCalled);
			});
	});

	it('supports asset emission', () => {
		return rollup
			.rollup({
				input: 'input',
				experimentalCodeSplitting: true,
				experimentalDynamicImport: true,
				plugins: [
					loader({ input: '' }),
					{
						transform (code, id) {
							const assetId = this.emitAsset('test.ext', 'hello world');
							return `export default import.meta.ROLLUP_ASSET_URL_${assetId};`;
						}
					}
				]
			})
			.then(bundle => {
				return bundle.generate({ format: 'es' });
			})
			.then(outputBundle => {
				assert.equal(outputBundle['assets/test-19916f7d.ext'], 'hello world');
				assert.equal(outputBundle['input.js'].code, `var input = new URL(\'../assets/test-19916f7d.ext\', import.meta.url).href;\n\nexport default input;\n`);
			});
	});

	it('supports CommonJS asset urls', () => {
		return rollup
			.rollup({
				input: 'input',
				experimentalCodeSplitting: true,
				experimentalDynamicImport: true,
				plugins: [
					loader({ input: '' }),
					{
						transform (code, id) {
							const assetId = this.emitAsset('test.ext', 'hello world');
							return `export default import.meta.ROLLUP_ASSET_URL_${assetId};`;
						}
					}
				]
			})
			.then(bundle => {
				return bundle.generate({ format: 'cjs' });
			})
			.then(outputBundle => {
				assert.equal(outputBundle['input.js'].code, `'use strict';

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
						transform (code, id) {
							const assetId = this.emitAsset('test.ext', 'hello world');
							return '';
						}
					}
				]
			})
			.then(bundle => {
				return bundle.generate({
					format: 'es',
					assetFileNames: '[name][ext]'
				});
			})
			.then(outputBundle => {
				assert.equal(outputBundle['test.ext'], 'hello world');
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
						transform (code, id) {
							assetId = this.emitAsset('test.ext');
							return '';
						},
						processChunks () {
							this.setAssetSource(assetId, 'hello world');
						}
					}
				]
			})
			.then(bundle => {
				return bundle.generate({ format: 'es' });
			})
			.then(outputBundle => {
				assert.equal(outputBundle['assets/test-19916f7d.ext'], 'hello world');
			});
	});

	it('throws when setting asset source twice', () => {
		return rollup
			.rollup({
				input: 'input',
				experimentalCodeSplitting: true,
				plugins: [
					loader({ input: `alert('hello')` }),
					{
						transform (code, id) {
							const assetId = this.emitAsset('test.ext');
							this.setAssetSource(assetId, 'hello world');
							try {
								this.setAssetSource(assetId, 'another');
							}
							catch (e) {
								assert.equal(e.code, 'ASSET_SOURCE_ALREADY_SET');
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
			.then(outputBundle => {
				assert.equal(outputBundle['assets/test-19916f7d.ext'], 'hello world');
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
						transformBundle (code, id) {
							calledHook = true;
							try {
								const assetId = this.emitAsset('test.ext', 'hello world');
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
					assetFileNames: '[name][ext]'
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
								const assetId = this.emitAsset('test.ext', 'hello world');
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
					assetFileNames: '[name][ext]'
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
				experimentalDynamicImport: true,
				plugins: [
					loader({ input: `alert('hello')` }),
					{
						transform (code, id) {
							const assetId = this.emitAsset('test.ext', 'hello world');
							return `export default import.meta.ROLLUP_ASSET_URL_${assetId};`;
						},
						generateBundle (options, outputBundle, isWrite) {
							assert.equal(outputBundle['assets/test-19916f7d.ext'], 'hello world');
							assert.equal(outputBundle['input.js'].code, `var input = new URL(\'../assets/test-19916f7d.ext\', import.meta.url).href;\n\nexport default input;\n`);
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
				experimentalDynamicImport: true,
				plugins: [
					loader({ input: `alert('hello')` }),
					{
						generateBundle (options, outputBundle, isWrite) {
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
			.then(([outputBundle1, outputBundle2]) => {
				assert.equal(outputBundle1['input.js'].code, `alert('hello');\n`);
				assert.equal(outputBundle1['assets/lateDepAsset-671f747d'], `custom source`);
				assert.equal(outputBundle1['assets/lateMainAsset-863ea4b5'], `references assets/lateDepAsset-671f747d`);

				assert.equal(outputBundle2['input.js'].code, `'use strict';\n\nalert('hello');\n`);
				assert.equal(outputBundle2['assets/lateDepAsset-671f747d'], undefined);
				assert.equal(outputBundle2['assets/lateMainAsset-863ea4b5'], undefined);
				assert.equal(outputBundle2['assets/lateDepAsset-c107f5fc'], `different source`);
				assert.equal(outputBundle2['assets/lateMainAsset-6dc2262b'], `references assets/lateDepAsset-c107f5fc`);
			});
	});

	it('supports errors thrown in the generateBundle hook', () => {
		return rollup
			.rollup({
				input: 'input',
				experimentalCodeSplitting: true,
				experimentalDynamicImport: true,
				plugins: [
					loader({ input: `alert('hello')` }),
					{
						generateBundle (options, outputBundle, isWrite) {
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


	it('supports processBundle hook including reporting tree-shaken exports', () => {
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
						processChunks (chunks) {
							assert.equal(chunks.length, 1);

							// can detect that b has been tree-shaken this way
							assert.equal(chunks[0]['dep'][0], 'a');
							assert.equal(chunks[0]['dep'].length, 1);
						}
					}
				]
			})
			.then(bundle => {
				return bundle.generate({ format: 'es' });
			});
	});
});
