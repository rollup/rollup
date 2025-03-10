const { loader } = require('../../../testHelpers.js');

module.exports = defineTest({
	description: 'supports hashes in the browser build',
	options: {
		input: ['main', 'dep'],
		plugins: loader({
			main: `import {foo} from 'dep';
console.log(foo);`,
			dep: `export const foo = 42;`
		}),
		output: {
			entryFileNames: '[name]-[hash].js'
		}
	}
});
