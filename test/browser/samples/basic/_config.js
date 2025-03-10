const { loader } = require('../../../testHelpers.js');

module.exports = defineTest({
	description: 'bundles files for the browser',
	options: {
		plugins: loader({
			main: `import {foo} from 'dep';
console.log(foo);`,
			dep: `export const foo = 42;`
		})
	}
});
