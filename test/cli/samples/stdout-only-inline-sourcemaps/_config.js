const { assertStderrIncludes } = require('../../../utils.js');

module.exports = {
	description: 'fails when using non-inline sourcemaps when bundling to stdout',
	command: 'rollup -i main.js -f es -m',
	error: () => true,
	stderr: (stderr) => {
		assertStderrIncludes(
			stderr,
			'[!] Only inline sourcemaps are supported when bundling to stdout.\n'
		);
	},
};
