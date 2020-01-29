const assert = require('assert');
const rollup = require('../../dist/rollup');
const { loader } = require('../utils.js');

describe('deprecations', () => {
	it('supports esm format alias', () => {
		return rollup
			.rollup({ input: 'x', plugins: [loader({ x: 'export const x = function () {}' })] })
			.then(bundle => bundle.generate({ format: 'esm' }))
			.then(({ output: [{ code }] }) => {
				assert.equal(code, 'const x = function () {};\n\nexport { x };\n');
			});
	});
});
