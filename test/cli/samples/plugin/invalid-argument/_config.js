const { assertIncludes } = require('../../../../utils.js');

module.exports = defineTest({
	description: 'invalid CLI --plugin argument format',
	skipIfWindows: true,
	command: `echo "console.log(123);" | rollup --plugin 'foo bar'`,
	error(error) {
		assertIncludes(error.message, '[!] Error: Invalid --plugin argument format: "foo bar"');
	}
});
