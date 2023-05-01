const assert = require('node:assert');

module.exports = defineTest({
	description: 'Dynamic import inlining when resolution id is a module in the bundle',
	exports(exports) {
		assert.equal(exports.y, 42);
		return Promise.resolve(exports.promise).then(value => {
			assert.equal(value, 84);
		});
	}
});
