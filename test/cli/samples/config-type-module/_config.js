// @ts-expect-error not included in types
const { assertIncludes } = require('../../../utils.js');

module.exports = defineTest({
	description: 'tries to load .js config file if package type is "module"',
	command: 'cd sub && rollup -c rollup.config.js',
	error: () => true,
	stderr: stderr => {
		assertIncludes(
			stderr,
			'Original error: module is not defined in ES module scope\n' +
				"This file is being treated as an ES module because it has a '.js' file extension and"
		);
		assertIncludes(
			stderr,
			'contains "type": "module". To treat it as a CommonJS script, rename it to use the \'.cjs\' file extension.'
		);
	}
});
