const assert = require('node:assert');

module.exports = defineTest({
	description: 'variables corresponding to globals can be exported',

	exports(exports) {
		assert.equal(exports.Buffer, Buffer);
	}
});
