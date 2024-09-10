const path = require('node:path');

const ID_JSX = path.join(__dirname, 'jsx.js');

module.exports = defineTest({
	description: 'throws when preserving JSX syntax with an unnecessary import source',
	options: {
		jsx: {
			importSource: ID_JSX,
			mode: 'preserve'
		}
	},
	error: {
		code: 'INVALID_OPTION',
		message:
			'Invalid value for option "jsx" - when preserving JSX and specifying an importSource, you also need to specify a factory or fragment.',
		url: 'https://rollupjs.org/configuration-options/#jsx'
	}
});
