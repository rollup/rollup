const assert = require('assert');

module.exports = {
	description: 'Dynamic import inlining when resolution id is a module in the bundle',
	code(code) {
		assert.equal(code.indexOf('import('), -1);
		assert.notEqual(code.indexOf('Promise.resolve('), -1);
	},
	exports(exports) {
		assert.deepEqual(exports, { y: 42 });
	}
};
