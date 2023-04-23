const path = require('node:path');

module.exports = defineTest({
	description: 'throw descriptive error if sourcemapIgnoreList-function does not return a boolean',
	options: {
		output: {
			name: 'myModule',
			sourcemap: true,
			file: path.join(__dirname, 'main.js'),
			sourcemapIgnoreList: () => {}
		}
	},
	generateError: {
		code: 'VALIDATION_ERROR',
		message: 'sourcemapIgnoreList function must return a boolean.'
	}
});
