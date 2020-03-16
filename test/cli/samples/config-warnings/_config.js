const { assertStderrIncludes } = require('../../../utils.js');

module.exports = {
	description: 'displays warnings when a config is loaded',
	command: 'rollup -c',
	stderr: stderr =>
		assertStderrIncludes(
			stderr,
			'loaded rollup.config.js with warnings\n(!) Use of eval is strongly discouraged'
		)
};
