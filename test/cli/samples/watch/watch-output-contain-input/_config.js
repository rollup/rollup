const { assertIncludes } = require('../../../../testHelpers.js');

module.exports = defineTest({
	description: 'throws if output contains input',
	spawnArgs: ['-cw'],
	error: () => true,
	stderr(stderr) {
		assertIncludes(
			stderr,
			'[!] RollupError: Invalid value for option "watch" - the input "main.js" is a subpath of the output "main.js".'
		);
	}
});
