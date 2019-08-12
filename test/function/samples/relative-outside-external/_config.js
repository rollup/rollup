const assert = require('assert');
const cwd = process.cwd;

module.exports = {
	description: 'correctly resolves relative external imports from outside directories',
	options: {
		external() {
			return true;
		}
	},
	before() {
		process.cwd = () => '/';
	},
	context: {
		require(id) {
			return id;
		}
	},
	exports(exports) {
		process.cwd = cwd;
		assert.strictEqual(exports.value, '../../../test.js');
	}
};
