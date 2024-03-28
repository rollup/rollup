const { sep } = require('node:path');
const { assertIncludes } = require('../../../utils.js');

module.exports = defineTest({
	description: 'displays warnings from plugins',
	command: 'rollup -c',
	env: { FORCE_COLOR: undefined, NO_COLOR: true },
	stderr: stderr => {
		assertIncludes(
			stderr.replaceAll(__dirname + sep, 'CWD/'),
			'[plugin second-plugin] other.js: Fifth\n' + 'CWD/other.js\n'
		);
		assertIncludes(
			stderr.replaceAll(__dirname + sep, 'CWD/'),
			'(!) [plugin test-plugin] First\n' +
				'(!) [plugin test-plugin] Second\n' +
				'https://information\n' +
				'(!) [plugin second-plugin] other.js: Third\n' +
				'CWD/other.js\n' +
				'(!) [plugin second-plugin] other.js (1:2): Fourth\n' +
				'CWD/other.js:1:2\n' +
				'custom frame'
		);
	}
});
