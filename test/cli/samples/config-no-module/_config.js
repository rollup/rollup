const { assertStderrIncludes } = require('../../../utils.js');

module.exports = {
	description: 'provides a helpful error message if a transpiled config is interpreted as "module"',
	minNodeVersion: 13,
	command: 'cd sub && rollup -c',
	error: () => true,
	stderr: (stderr) =>
		assertStderrIncludes(
			stderr,
			'[!] Error: While loading the Rollup configuration from "rollup.config.js", Node tried to require an ES module from a CommonJS ' +
				'file, which is not supported. A common cause is if there is a package.json file with "type": "module" in the same folder. You can ' +
				'try to fix this by changing the extension of your configuration file to ".cjs" or ".mjs" depending on the content, which will ' +
				'prevent Rollup from trying to preprocess the file but rather hand it to Node directly.\n' +
				'https://rollupjs.org/guide/en/#using-untranspiled-config-files'
		),
};
