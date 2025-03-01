const path = require('node:path');
const { assertIncludes } = require('../../../testHelpers.js');

module.exports = defineTest({
	description: 'correctly adds locations to plugin warnings',
	command: 'rollup -c',
	stderr: stderr => {
		assertIncludes(
			stderr.replaceAll(__dirname + path.sep, 'CWD/'),
			'(!) [plugin test] file1 (1:2): Warning with file and id\n' +
				'CWD/file1:1:2\n' +
				'(!) [plugin test] file2 (2:3): Warning with file\n' +
				'CWD/file2:2:3\n' +
				'(!) [plugin test] file-id3 (3:4): Warning with id\n' +
				'CWD/file-id3:3:4\n'
		);
	}
});
