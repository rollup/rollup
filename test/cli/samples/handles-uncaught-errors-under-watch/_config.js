const { assertIncludes } = require('../../../testHelpers.js');

module.exports = defineTest({
	description: 'handles uncaught errors under watch',
	spawnArgs: ['--config', 'rollup.config.js', '-w'],
	error: () => true,
	stderr(stderr) {
		assertIncludes(stderr, 'Uncaught RollupError: [plugin test] LOL');
	}
});
