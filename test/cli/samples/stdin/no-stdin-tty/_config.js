const { assertIncludes } = require('../../../../utils.js');

module.exports = {
	description: 'does not use input as stdin on TTY interfaces',
	skipIfWindows: true,
	command: `echo "console.log('PASS');" | ./wrapper.js -f es`,
	error(err) {
		assertIncludes(err.message, 'You must supply options.input to rollup');
	}
};
