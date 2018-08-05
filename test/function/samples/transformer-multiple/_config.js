const assert = require('assert');

module.exports = {
	description: 'accepts multiple transformer functions',
	options: {
		plugins: [
			{
				transform(code, path) {
					return code.replace(/MAGIC_NUMBER/g, 3);
				}
			},

			{
				transform(code, path) {
					return code.replace(/\d+/g, (match) => {
						return 2 * +match;
					});
				}
			}
		]
	},
	exports(exports) {
		assert.equal(exports.magicNumber, 6);
	}
};
