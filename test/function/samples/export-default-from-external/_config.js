const assert = require('assert');
const path = require('path');

module.exports = {
	description: 'ensures external modules have correct names',
	options: {
		external: ['path']
	},
	exports(exports) {
		assert.equal(exports, path.sep);
	}
};
