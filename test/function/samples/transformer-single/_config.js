const assert = require('assert');

module.exports = {
	description: 'accepts a single transformer function',
	options: {
		plugins: [
			{
				transform(code) {
					return code.replace(/MAGIC_NUMBER/g, 3);
				}
			}
		]
	},
	exports(exports) {
		assert.equal(exports.magicNumber, 3);
	}
};
