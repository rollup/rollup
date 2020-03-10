const assert = require('assert');

module.exports = {
	description: 'Dynamic import inlining when resolution id is a module in the bundle',
	exports(exports) {
		assert.equal(exports.y, 42);
		return Promise.resolve(exports.promise).then(val => {
			assert.equal(val, 84);
		});
	}
};
