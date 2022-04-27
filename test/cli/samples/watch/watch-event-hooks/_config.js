const { assertIncludes } = require('../../../utils.js');

module.exports = {
	description: 'warns when eval is used',
	command: 'rollup -cw --watch.onStart="echo onStart"',
	stdout: stdout =>
		assertIncludes(
			stdout,
			'onStart'
		)
};
