const assert = require('node:assert/strict');

const amdExports = {};

module.exports = defineTest({
	description: 'runs exported var loop assignments in AMD output',
	options: { output: { format: 'amd' } },
	context: {
		define(_dependencies, factory) {
			factory(amdExports);
		}
	},
	exports() {
		assert.equal(amdExports.bodyVar, 3);
		assert.equal(amdExports.current, 1);
		assert.equal(amdExports.index, 2);
	}
});
