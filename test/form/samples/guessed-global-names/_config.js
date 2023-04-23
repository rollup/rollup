const { resolve } = require('node:path');

module.exports = defineTest({
	description: 'guesses global names if necessary',
	expectedWarnings: ['MISSING_GLOBAL_NAME'],
	options: {
		external: [
			'unchanged',
			'changed',
			'special-character',
			'with/slash',
			resolve(__dirname, 'relative.js')
		]
	}
});
