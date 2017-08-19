const path = require('path');
const assert = require('assert');
const sander = require('sander');
const { loader } = require('../utils.js');
const rollup = require('../../dist/rollup.js');

describe('hooks', () => {
	it('passes bundle & output object to ongenerate & onwrite hooks', () => {
		const output = path.join(__dirname, 'tmp/bundle.js');

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
					output,
					format: 'es'
				});
			})
			.then(() => {
				return sander.unlink(output);
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
		const output = path.join(__dirname, 'tmp/bundle.js');

		return rollup
			.rollup({
				input: 'input',
				plugins: [
					loader({ input: `alert('hello')` }),
					{
						onwrite(info) {
							return new Promise(fulfil => {
								result.push({ a: info.output, format: info.format });
								fulfil();
							});
						}
					},
					{
						onwrite(info) {
							result.push({ b: info.output, format: info.format });
						}
					}
				]
			})
			.then(bundle => {
				return bundle.write({
					output,
					format: 'cjs'
				});
			})
			.then(() => {
				assert.deepEqual(result, [
					{ a: output, format: 'cjs' },
					{ b: output, format: 'cjs' }
				]);

				return sander.unlink(output);
			});
	});
});
