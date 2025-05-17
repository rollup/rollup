const { assertIncludes } = require('../../../testHelpers.js');

module.exports = defineTest({
	description: 'throws if different types of entries are combined',
	spawnArgs: ['main.js', '--format', 'es', '--input', 'main.js'],
	error: () => true,
	stderr(stderr) {
		assertIncludes(stderr, '[!] Either use --input, or pass input path as argument');
	}
});
