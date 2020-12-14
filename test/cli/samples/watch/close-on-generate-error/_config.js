const { assertIncludes } = require('../../../../utils.js');

module.exports = {
	description: 'closes the bundle on generate errors',
	command: 'rollup -cw',
	abortOnStderr(data) {
		if (data.includes('Bundle closed')) {
			return true;
		}
	},
	stderr(stderr) {
		assertIncludes(
			stderr,
			'[!] Error: You must specify "output.file" or "output.dir" for the build.'
		);
		assertIncludes(stderr, 'Bundle closed');
		return false;
	}
};
