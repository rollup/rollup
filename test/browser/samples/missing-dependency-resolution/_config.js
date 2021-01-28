const { loader } = require('../../../utils.js');

module.exports = {
	description: 'fails if a dependency cannot be resolved',
	options: {
		plugins: loader({
			main: `import {foo} from 'dep';
console.log(foo);`
		})
	},
	error: {
		message:
			"Unexpected warnings (UNRESOLVED_IMPORT): 'dep' is imported by main, but could not be resolved – treating it as an external dependency\nIf you expect warnings, list their codes in config.expectedWarnings",
		watchFiles: ['main']
	}
};
