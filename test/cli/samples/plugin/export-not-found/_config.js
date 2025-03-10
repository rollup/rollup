const path = require('node:path');
const { assertIncludes } = require('../../../../testHelpers.js');

module.exports = defineTest({
	description: 'Throws when the plugin export cannot be found',
	skipIfWindows: true,
	command: `echo 'console.log("ignored");' | rollup -p "./my-missing-plugin"`,
	error(error) {
		assertIncludes(
			error.message,
			`[!] Error: Cannot find entry for plugin "${path.join(
				__dirname,
				'my-missing-plugin'
			)}". The plugin needs to export a function either as "default" or "myMissingPlugin" for Rollup to recognize it.`
		);
	}
});
