const assert = require('assert');

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
	runtimeError(error) {
		assert.equal(error.message.split('\n')[0], "Cannot find module 'asdf'");
	}
};
