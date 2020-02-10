const { assertStderrIncludes } = require('../../../../utils.js');

module.exports = {
	description: 'unknown CLI --plugin results in an error',
	skipIfWindows: true,
	command: `echo "console.log(123);" | rollup --plugin foobar`,
	stderr(err) {
		assertStderrIncludes(err, "Cannot load plugin 'foobar'");
	}
};
