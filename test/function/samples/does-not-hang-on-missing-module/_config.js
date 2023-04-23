const assert = require('node:assert');
const path = require('node:path');
const ID_MAIN = path.join(__dirname, 'main.js');

module.exports = defineTest({
	description: 'does not hang on missing module (#53)',
	warnings: [
		{
			code: 'UNRESOLVED_IMPORT',
			exporter: 'unlessYouCreatedThisFileForSomeReason',
			id: ID_MAIN,
			message:
				'"unlessYouCreatedThisFileForSomeReason" is imported by "main.js", but could not be resolved – treating it as an external dependency.',
			url: 'https://rollupjs.org/troubleshooting/#warning-treating-module-as-external-dependency'
		}
	],
	runtimeError(error) {
		assert.equal(
			error.message.split('\n')[0],
			"Cannot find module 'unlessYouCreatedThisFileForSomeReason'"
		);
	}
});
