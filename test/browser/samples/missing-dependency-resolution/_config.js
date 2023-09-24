const { loader } = require('../../../utils.js');

module.exports = defineTest({
	description: 'fails if a dependency cannot be resolved',
	options: {
		plugins: loader({
			main: `import {foo} from 'dep';
console.log(foo);`
		})
	},
	error: {
		code: 'NO_FS_IN_BROWSER',
		message:
			'Cannot access the file system (via "path.resolve") when using the browser build of Rollup. Make sure you supply a plugin with custom resolveId and load hooks to Rollup.',
		url: 'https://rollupjs.org/plugin-development/#a-simple-example'
	}
});
