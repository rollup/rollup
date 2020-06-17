const { assertIncludes } = require('../../../../utils.js');

module.exports = {
	description: 'invalid CLI --plugin argument format',
	skipIfWindows: true,
	command: `echo "console.log(123);" | rollup --plugin 'foo bar'`,
	error(err) {
		assertIncludes(err.message, '[!] Error: Invalid --plugin argument format: "foo bar"');
	}
};
