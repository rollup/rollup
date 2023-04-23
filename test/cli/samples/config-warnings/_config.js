const { assertIncludes } = require('../../../utils.js');

module.exports = defineTest({
	description: 'displays warnings when a config is loaded',
	command: 'rollup -c --bundleConfigAsCjs',
	stderr: stderr =>
		assertIncludes(
			stderr,
			'loaded rollup.config.js with warnings\n(!) Use of eval is strongly discouraged'
		)
});
