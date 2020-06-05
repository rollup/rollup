const path = require('path');

module.exports = {
	description:
		'pass the file path to sourcemapPathTransform',
	options: {
		output: {
			name: 'myModule',
			sourcemap: true,
			file: path.resolve(__dirname, 'main.js'),
			sourcemapPathTransform: (relativePath, sourcemapPath) => path.resolve(sourcemapPath, relativePath)
		}
	},
	generateError: {
		code: 'VALIDATION_ERROR',
		message: 'sourcemapPathTransform function must return a string.'
	}
};
