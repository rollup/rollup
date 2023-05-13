const { assertIncludes } = require('../../../utils.js');

module.exports = defineTest({
	description: 'handles uncaught errors',
	command: 'rollup --config rollup.config.js',
	error: () => true,
	stderr(stderr) {
		assertIncludes(stderr, 'TypeError: foo');
	}
});
