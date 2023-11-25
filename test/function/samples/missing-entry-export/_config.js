const path = require('node:path');
const ID_MAIN = path.join(__dirname, 'main.js');

module.exports = defineTest({
	description: 'throws when exporting something that does not exist from an entry',
	verifyAst: false,
	error: {
		binding: 'doesNotExist',
		code: 'MISSING_EXPORT',
		exporter: ID_MAIN,
		message: 'Exported variable "doesNotExist" is not defined in "main.js".',
		url: 'https://rollupjs.org/troubleshooting/#error-name-is-not-exported-by-module',
		watchFiles: [ID_MAIN]
	}
});
