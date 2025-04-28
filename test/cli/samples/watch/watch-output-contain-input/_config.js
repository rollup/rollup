const { assertIncludes } = require('../../../../testHelpers.js');

module.exports = defineTest({
	description: 'throws if output contains input',
	command: 'rollup -cw',
	error: () => true,
	stderr(stderr) {
		assertIncludes(
			stderr,
			'[!] RollupError: Invalid value for option "watch" - the input should not be inside the output dir.'
		);
	}
});
