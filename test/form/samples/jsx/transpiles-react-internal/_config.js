const path = require('node:path');
module.exports = defineTest({
	description: 'transpiles JSX for react',
	options: {
		jsx: {
			importSource: path.join(__dirname, 'react.js'),
			preset: 'react'
		}
	}
});
