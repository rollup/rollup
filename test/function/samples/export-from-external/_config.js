const assert = require('node:assert');
const path = require('node:path');

module.exports = defineTest({
	description: 'exports directly from an external module',
	options: {
		external: ['path']
	},
	exports(exports) {
		assert.equal(exports.sep, path.sep);
	}
});

// https://github.com/esperantojs/esperanto/issues/161
