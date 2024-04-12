const assert = require('node:assert');
const path = require('node:path');

module.exports = defineTest({
	description: 'includes a relative external module only once (two external deps)',
	options: {
		external: [path.join(__dirname, './foo.js'), path.join(__dirname, './first/foo.js')]
	},
	context: {
		require(required) {
			assert.ok(['./foo.js', './first/foo.js'].includes(required), 'required wrong module');
			return required === './foo.js' ? 'a' : 'b';
		}
	},
	exports(exports) {
		assert.ok(exports === 'ab' || exports === 'ba', 'two different modules should be required');
	}
});
