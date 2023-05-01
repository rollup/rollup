const { loader } = require('../../../utils.js');

module.exports = defineTest({
	description: 'bundles files for the browser',
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
