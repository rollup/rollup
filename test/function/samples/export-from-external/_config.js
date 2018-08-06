const assert = require('assert');
const path = require('path');

module.exports = {
	description: 'exports directly from an external module',
	options: {
		external: ['path']
	},
	exports(exports) {
		assert.equal(exports.sep, path.sep);
	}
};

// https://github.com/esperantojs/esperanto/issues/161
