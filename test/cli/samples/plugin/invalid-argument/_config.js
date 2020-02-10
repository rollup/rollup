const { assertStderrIncludes } = require('../../../../utils.js');

module.exports = {
	description: 'invalid CLI --plugin argument format',
	skipIfWindows: true,
	command: `echo "console.log(123);" | rollup --plugin 'foo bar'`,
	stderr(err) {
		assertStderrIncludes(err, 'Invalid --plugin argument format: "foo bar"');
	}
};
