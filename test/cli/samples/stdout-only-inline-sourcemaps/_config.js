const { assertIncludes } = require('../../../utils.js');

module.exports = defineTest({
	description: 'fails when using non-inline sourcemaps when bundling to stdout',
	command: 'rollup -i main.js -f es -m',
	error: () => true,
	stderr: stderr => {
		assertIncludes(stderr, '[!] Only inline sourcemaps are supported when bundling to stdout.\n');
	}
});
