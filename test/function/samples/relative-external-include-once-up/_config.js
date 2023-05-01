const assert = require('node:assert');
const path = require('node:path');

module.exports = defineTest({
	description: 'includes a relative external module only once (from upper directory too)',
	options: {
		input: path.join(__dirname, 'first', 'main.js'),
		external: path.join(__dirname, './foo.js')
	},
	context: {
		require(required) {
			assert.equal(required, '../foo.js');
			return 1;
		}
	},
	exports(exports) {
		assert.equal(exports, 3);
	}
});
