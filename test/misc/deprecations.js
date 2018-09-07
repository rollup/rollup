const assert = require('assert');
const rollup = require('../../dist/rollup');
const { loader } = require('../utils.js');

describe('deprecations', () => {
	it('throws a useful error on accessing code/map properties of bundle.generate promise', () => {
		return rollup
			.rollup({
				input: 'x',
				plugins: [loader({ x: `console.log( 42 );` })]
			})
			.then(bundle => {
				let errored = false;

				try {
					const { code, map } = bundle.generate({ format: 'es' });
					console.log(code, map);
				} catch (err) {
					assert.equal(
						err.message,
						`bundle.generate(...) now returns a Promise instead of a { code, map } object`
					);
					errored = true;
				}

				assert.ok(errored);
			});
	});

	it('supports esm format alias', () => {
		return rollup
			.rollup({ input: 'x', plugins: [loader({ x: 'export const x = function () {}' })] })
			.then(bundle => bundle.generate({ format: 'esm' }))
			.then(({ output: [{ code }] }) => {
				assert.equal(code, 'const x = function () {};\n\nexport { x };\n');
			});
	});
});
