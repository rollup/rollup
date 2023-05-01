const assert = require('node:assert');
const path = require('node:path');

module.exports = defineTest({
	description: 'includes a relative external module only once (nested version)',
	options: {
		external: path.join(__dirname, './first/foo.js')
	},
	context: {
		require(required) {
			assert.equal(required, './first/foo.js');
			return 1;
		}
	},
	exports(exports) {
		assert.equal(exports, 3);
	}
});
