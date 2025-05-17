const { assertIncludes } = require('../../../testHelpers.js');

module.exports = defineTest({
	description: 'fails when using non-inline sourcemaps when bundling to stdout',
	spawnArgs: ['-i', 'main.js', '-f', 'es', '-m'],
	error: () => true,
	stderr: stderr => {
		assertIncludes(stderr, '[!] Only inline sourcemaps are supported when bundling to stdout.\n');
	}
});
