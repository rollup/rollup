const path = require('node:path');

module.exports = defineTest({
	description: 'uses the decoded value of JSX string attributes and keys in automatic mode',
	options: {
		jsx: {
			jsxImportSource: path.join(__dirname, 'jsx-runtime.js'),
			preset: 'react-jsx'
		}
	}
});
