const assert = require('node:assert');

module.exports = defineTest({
	description: 'exported values do not mysteriously disappear (#484)',
	exports(exports) {
		assert.equal(exports.exportedAnswer, 42);
		assert.equal(exports.foo(), 42);
	}
});
