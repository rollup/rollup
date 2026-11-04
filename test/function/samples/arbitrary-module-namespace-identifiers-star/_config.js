const assert = require('node:assert/strict');

module.exports = defineTest({
	description: 'executes reassigned and synthetic exports with names that start with "*"',
	options: {
		plugins: [
			{
				name: 'test-plugin',
				transform(code, id) {
					if (id.endsWith('synthetic.js')) {
						return { code, syntheticNamedExports: true };
					}
				}
			}
		]
	},
	exports(exports) {
		assert.equal(exports['*count'], 0);
		exports.increment();
		assert.equal(exports['*count'], 1);
	}
});
