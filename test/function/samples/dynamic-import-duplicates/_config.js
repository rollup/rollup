var assert = require('assert');
var path = require('path');

module.exports = {
	description: 'Dynamic import inlining',
	options: {
		experimentalDynamicImport: true,
		plugins: [{
			resolveDynamicImport (specifier, parent) {
				if (specifier === './main')
					return path.resolve(__dirname, 'main.js');
			}
		}]
	},
	exports: function (exports) {
		assert.equal(exports.x, 41);
		return exports.promise.then(y => {
			assert.equal(y, 42);
		});
	}
};
