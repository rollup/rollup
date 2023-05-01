const { assertIncludes } = require('../../../utils.js');

module.exports = defineTest({
	description: 'correctly adds locations to plugin warnings',
	command: 'rollup -c',
	stderr: stderr => {
		assertIncludes(
			stderr,
			'(!) Plugin test: Warning with file and id\n' +
				'file1: (1:2)\n' +
				'(!) Plugin test: Warning with file\n' +
				'file2: (2:3)\n' +
				'(!) Plugin test: Warning with id\n' +
				'file-id3: (3:4)\n'
		);
	}
});
