const path = require('path');
const assert = require('assert');
const sander = require('sander');
const { loader } = require('../utils.js');
const rollup = require('../../dist/rollup.js');

describe('hooks', () => {
	it('passes bundle & output object to ongenerate & onwrite hooks', () => {
		const dest = path.join(__dirname, 'tmp/bundle.js');

		return rollup
			.rollup({
				entry: 'entry',
				plugins: [
					loader({ entry: `alert('hello')` }),
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
					dest,
					format: 'es'
				});
			})
			.then(() => {
				return sander.unlink(dest);
			});
	});

	it('calls ongenerate hooks in sequence', () => {
		const result = [];

		return rollup
			.rollup({
				entry: 'entry',
				plugins: [
					loader({ entry: `alert('hello')` }),
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
		const dest = path.join(__dirname, 'tmp/bundle.js');

		return rollup
			.rollup({
				entry: 'entry',
				plugins: [
					loader({ entry: `alert('hello')` }),
					{
						onwrite(info) {
							return new Promise(fulfil => {
								result.push({ a: info.dest, format: info.format });
								fulfil();
							});
						}
					},
					{
						onwrite(info) {
							result.push({ b: info.dest, format: info.format });
						}
					}
				]
			})
			.then(bundle => {
				return bundle.write({
					dest,
					format: 'cjs'
				});
			})
			.then(() => {
				assert.deepEqual(result, [
					{ a: dest, format: 'cjs' },
					{ b: dest, format: 'cjs' }
				]);

				return sander.unlink(dest);
			});
	});
});
