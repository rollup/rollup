const { assertStderrIncludes } = require('../../../utils.js');

module.exports = {
	description: 'custom (plugin generated) code frame taking priority over pos generated one',
	command: 'rollup -c',
	error: () => true,
	stderr: stderr =>
		assertStderrIncludes(
			stderr,
			'[!] (plugin at position 1) Error: My error.\n' +
				'main.js (1:5)\n' +
				'custom code frame\n' +
				'Error: My error.'
		)
};
