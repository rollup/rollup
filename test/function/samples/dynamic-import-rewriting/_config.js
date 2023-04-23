const assert = require('node:assert');

module.exports = defineRollupTest({
	description: 'Dynamic import string specifier resolving',
	options: {
		external: ['asdf'],
		plugins: [
			{
				resolveDynamicImport() {
					return 'asdf';
				}
			}
		]
	},
	exports(exports) {
		const expectedError = "Cannot find package 'asdf'";
		return exports.promise.catch(error =>
			assert.strictEqual(error.message.slice(0, expectedError.length), expectedError)
		);
	}
});
