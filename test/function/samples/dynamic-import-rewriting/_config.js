var assert = require('assert');

module.exports = {
	description: 'Dynamic import string specifier resolving',
	options: {
		external: ['asdf'],
		plugins: [
			{
				resolveDynamicImport(specifier, parent) {
					return 'asdf';
				}
			}
		]
	},
	exports(exports) {
		return exports.promise;
	},
	runtimeError: function(error) {
		assert.equal("Cannot find module 'asdf'", error.message);
	}
};
