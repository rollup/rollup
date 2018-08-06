var assert = require('assert');
var path = require('path');

module.exports = {
	description: 'includes an external module with a false resolve return',
	options: {
		input: 'main.js',
		plugins: [
			{
				resolveId: function(id) {
					if (id === './external')
						return false;
				}
			}
		]
	},
	context: {
		require: function(required) {
			assert.equal(required, './external');
			return 1;
		}
	}
};
