const { assertStderrIncludes } = require('../../../../utils.js');

module.exports = {
	description: 'throws if no config is watched',
	command: 'rollup -cw',
	error: () => true,
	stderr(stderr) {
		assertStderrIncludes(
			stderr,
			'[!] Error: Invalid value for option "watch" - there must be at least one config where "watch" is not set to "false".'
		);
	}
};
