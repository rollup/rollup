var path = require('path');
var assert = require('assert');

module.exports = {
	description: 'plugins can manipulate the options object',
	options: {
		plugins: [
			{
				options: function(options) {
					options.input = path.resolve(__dirname, 'answer.js');
				}
			}
		]
	},
	exports: function(answer) {
		assert.equal(answer, 42);
	}
};
