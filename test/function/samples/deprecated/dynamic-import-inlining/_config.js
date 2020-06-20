const assert = require('assert');

module.exports = {
	description: 'Dynamic import inlining',
	options: {
		strictDeprecations: false,
		inlineDynamicImports: true
	},
	exports(exports) {
		assert.equal(exports.x, 41);
		return exports.promise.then(y => {
			assert.equal(y, 42);
		});
	}
};
