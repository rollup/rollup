const assert = require('assert');
const path = require('path');

module.exports = {
	description: 'handles circular reexports',
	exports(exports) {
		assert.strictEqual(exports.exists, 42);
	},
	error: {
		code: 'CIRCULAR_REEXPORT',
		id: path.join(__dirname, 'dep1.js'),
		message:
			'"doesNotExist" cannot be exported from dep1.js as it is a reexport that references itself.',
		watchFiles: [
			path.join(__dirname, 'dep1.js'),
			path.join(__dirname, 'dep2.js'),
			path.join(__dirname, 'main.js')
		]
	}
};
