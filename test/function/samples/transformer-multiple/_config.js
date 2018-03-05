var assert = require('assert');

module.exports = {
	description: 'accepts multiple transformer functions',
	options: {
		plugins: [
			{
				transform: function(code, path) {
					return code.replace(/MAGIC_NUMBER/g, 3);
				}
			},

			{
				transform: function(code, path) {
					return code.replace(/\d+/g, function(match) {
						return 2 * +match;
					});
				}
			}
		]
	},
	exports: function(exports) {
		assert.equal(exports.magicNumber, 6);
	}
};
