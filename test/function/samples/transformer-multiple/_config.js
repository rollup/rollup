const assert = require('node:assert');

module.exports = defineTest({
	description: 'accepts multiple transformer functions',
	options: {
		plugins: [
			{
				transform(code) {
					return code.replace(/MAGIC_NUMBER/g, 3);
				}
			},

			{
				transform(code) {
					return code.replace(/\d+/g, match => 2 * +match);
				}
			}
		]
	},
	exports(exports) {
		assert.equal(exports.magicNumber, 6);
	}
});
