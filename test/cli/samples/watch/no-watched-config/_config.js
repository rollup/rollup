const { assertIncludes } = require('../../../../testHelpers.js');

module.exports = defineTest({
	description: 'throws if no config is watched',
	spawnArgs: ['-cw'],
	error: () => true,
	stderr(stderr) {
		assertIncludes(
			stderr,
			'[!] RollupError: Invalid value for option "watch" - there must be at least one config where "watch" is not set to "false".'
		);
	}
});
