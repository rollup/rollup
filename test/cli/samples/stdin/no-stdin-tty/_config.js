const { assertStderrIncludes } = require('../../../../utils.js');

module.exports = {
	description: 'does not use input as stdin on TTY interfaces',
	command: `shx echo "console.log('PASS');" | ./wrapper.js -f es`,
	error(err) {
		assertStderrIncludes(err.message, 'You must supply options.input to rollup');
	}
};
