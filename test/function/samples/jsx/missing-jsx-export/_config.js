const path = require('node:path');

const ID_REACT_JSX = path.join(__dirname, 'react-jsx.js');
const ID_MAIN = path.join(__dirname, 'main.js');

module.exports = defineTest({
	description: 'throws when the JSX factory is not exported',
	options: {
		jsx: {
			jsxImportSource: ID_REACT_JSX,
			preset: 'react-jsx'
		}
	},
	error: {
		code: 'MISSING_JSX_EXPORT',
		exporter: ID_REACT_JSX,
		frame: `
			1: const Foo = () => {};
			2: console.log(<Foo />);
			               ^`,
		id: ID_MAIN,
		loc: {
			column: 12,
			file: ID_MAIN,
			line: 2
		},
		message:
			'main.js (2:12): Export "jsx" is not defined in module "react-jsx.js" even though it is needed in "main.js" to provide JSX syntax. Please check your "jsx" option.',
		names: ['jsx'],
		pos: 34,
		url: 'https://rollupjs.org/configuration-options/#jsx',
		watchFiles: [ID_MAIN, ID_REACT_JSX]
	}
});
