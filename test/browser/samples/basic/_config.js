const { loader } = require('../../../utils.js');

module.exports = {
	show: true,
	description: 'bundles files for the browser',
	options: {
		plugins: loader({
			main: `import {foo} from 'dep';
console.log(foo);`,
			dep: `export const foo = 42;`
		})
	}
};
