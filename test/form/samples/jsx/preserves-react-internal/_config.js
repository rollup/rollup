const path = require('node:path');

module.exports = defineTest({
	// solo: true,
	description: 'preserves internal React variable when preserving JSX output',
	options: {
		jsx: {
			importSource: path.join(__dirname, 'react.js'),
			preset: 'preserve-react'
		}
	}
});
