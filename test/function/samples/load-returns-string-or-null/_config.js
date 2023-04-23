const path = require('node:path');
const ID_MAIN = path.join(__dirname, 'main.js');

module.exports = defineTest({
	description: 'throws error if load returns something wacky',
	options: {
		plugins: [
			{
				name: 'bad-plugin',
				load() {
					return 42;
				}
			}
		]
	},
	error: {
		code: 'BAD_LOADER',
		watchFiles: [ID_MAIN],
		message:
			'Error loading "main.js": plugin load hook should return a string, a { code, map } object, or nothing/null.'
	}
});
