const assert = require('assert');

module.exports = {
	description: 'import namespace from chunks with default export mode when preserving modules',
	options: {
		input: ['main', 'lib'],
		output: {
			preserveModules: true
		}
	},
	exports(exports) {
		assert.deepStrictEqual(exports, { lib: { __proto__: null, default: 'foo' } });
	}
};
