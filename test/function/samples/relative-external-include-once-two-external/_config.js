const assert = require('assert');
const path = require('path');

module.exports = {
	description: 'includes a relative external module only once (two external deps)',
	options: {
		external: [path.join(__dirname, './foo.js'), path.join(__dirname, './first/foo.js')]
	},
	context: {
		require(required) {
			assert(['./foo.js', './first/foo.js'].indexOf(required) !== -1, 'required wrong module');
			return required === './foo.js' ? 'a' : 'b';
		}
	},
	exports(exports) {
		assert(exports === 'ab' || exports === 'ba', 'two different modules should be required');
	}
};
