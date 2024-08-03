const path = require('node:path');

const ID_REACT = path.join(__dirname, 'react.js');
const ID_MAIN = path.join(__dirname, 'main.js');

module.exports = defineTest({
	description: 'throws when the JSX factory is not exported',
	options: {
		jsx: {
			importSource: ID_REACT,
			preset: 'react-jsx'
		}
	},
	error: {
		code: 'MISSING_JSX_EXPORT',
		exporter: ID_REACT,
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
			'main.js (2:12): Export "jsx" is not defined in module "react.js" even though it is needed in "main.js" to provide JSX syntax. Please check your "jsx" option.',
		names: ['jsx'],
		pos: 34,
		url: 'https://rollupjs.org/configuration-options/#jsx',
		watchFiles: [ID_MAIN, ID_REACT]
	}
});
