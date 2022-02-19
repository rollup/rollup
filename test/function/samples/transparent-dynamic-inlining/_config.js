const assert = require('assert');

module.exports = {
	description: 'Dynamic import inlining when resolution id is a module in the bundle',
	code(code) {
		assert.ok(!code.includes('import('));
		assert.ok(code.includes('Promise.resolve('));
	},
	exports(exports) {
		assert.deepEqual(exports, { y: 42 });
	}
};
