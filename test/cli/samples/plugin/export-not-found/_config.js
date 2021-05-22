const path = require('path');
const { assertIncludes } = require('../../../../utils.js');

module.exports = {
	description: 'Throws when the plugin export cannot be found',
	skipIfWindows: true,
	command: `echo 'console.log("ignored");' | rollup -p "./my-missing-plugin"`,
	error(err) {
		assertIncludes(
			err.message,
			`[!] Error: Cannot find entry for plugin "${path.join(
				__dirname,
				'my-missing-plugin'
			)}". The plugin needs to export a function either as "default" or "myMissingPlugin" for Rollup to recognize it.`
		);
	}
};
