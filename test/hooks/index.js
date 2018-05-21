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

	it('passes bundle object to generateBundle hook, supporting asset emission', () => {
		return rollup
			.rollup({
				input: 'input',
				experimentalCodeSplitting: true,
				plugins: [
					loader({ input: `alert('hello')` }),
					{
						generateBundle (options, outputBundle, getAssetFileName, isWrite) {
							const assetSource = 'asset';
							outputBundle[getAssetFileName('test.ext', assetSource)] = assetSource;
						}
					}
				]
			})
			.then(bundle => {
				return bundle.generate({ format: 'es' });
			})
			.then(outputBundle => {
				assert.equal(outputBundle['assets/test-a1355196.ext'], 'asset');
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
						generateBundle (options, outputBundle, getAssetFileName, isWrite) {
							const assetSource = 'asset';
							outputBundle[getAssetFileName('test.ext', assetSource)] = assetSource;
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
				assert.equal(outputBundle['test.ext'], 'asset');
			});
	});
});
