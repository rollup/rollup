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
		return exports.promise.catch(err => assert.equal(err.message, "Cannot find module 'asdf'"));
	}
};
