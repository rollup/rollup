const assert = require('assert');

module.exports = {
	description: 'handles dynamic imports from facades using default export mode',
	options: {
		input: ['main', 'foo', 'bar']
	},
	exports(exports) {
		return exports.then(exported =>
			assert.deepStrictEqual(exported, { __proto__: null, default: 4 })
		);
	}
};
