var assert = require('assert');

module.exports = {
	description: 'throws error if load returns something wacky',
	options: {
		plugins: [
			{
				name: 'bad-plugin',
				load: function() {
					return 42;
				}
			}
		]
	},
	error: {
		code: 'BAD_LOADER',
		message: `Error loading main.js: plugin load hook should return a string, a { code, map } object, or nothing/null`
	}
};
