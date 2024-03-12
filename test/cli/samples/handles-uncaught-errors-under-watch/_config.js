const { assertIncludes } = require('../../../utils.js');

module.exports = defineTest({
	description: 'handles uncaught errors under watch',
	command: 'rollup --config rollup.config.js -w',
	error: () => true,
	stderr(stderr) {
		assertIncludes(stderr, 'Uncaught RollupError: [plugin test] LOL');
	}
});
