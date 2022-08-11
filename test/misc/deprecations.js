const assert = require('node:assert');
const rollup = require('../../dist/rollup');
const { loader } = require('../utils.js');

describe('deprecations', () => {
	it('supports es format alias', () => {
		return rollup
			.rollup({ input: 'x', plugins: [loader({ x: 'export const x = function () {}' })] })
			.then(bundle => bundle.generate({ format: 'es' }))
			.then(({ output: [{ code }] }) => {
				assert.equal(code, 'const x = function () {};\n\nexport { x };\n');
			});
	});
});
