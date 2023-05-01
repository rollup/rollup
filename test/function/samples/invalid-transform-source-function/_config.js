const path = require('node:path');

module.exports = defineTest({
	description:
		'throw descriptive error if sourcemapPathTransform-function does not return a string (#3484)',
	options: {
		output: {
			name: 'myModule',
			sourcemap: true,
			file: path.join(__dirname, 'main.js'),
			sourcemapPathTransform: () => {}
		}
	},
	generateError: {
		code: 'VALIDATION_ERROR',
		message: 'sourcemapPathTransform function must return a string.'
	}
});
