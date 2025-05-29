const { assertIncludes } = require('../../../../testHelpers.js');

module.exports = defineTest({
	description: 'throws if output contains input',
	spawnArgs: ['-cw'],
	error: () => true,
	stderr(stderr) {
		assertIncludes(stderr, '');
	}
});
