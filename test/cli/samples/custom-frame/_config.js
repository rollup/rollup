const { assertIncludes } = require('../../../testHelpers.js');

module.exports = defineTest({
	description: 'errors with plugin generated code frames also contain stack',
	spawnArgs: ['-c'],
	error: () => true,
	stderr: stderr => {
		assertIncludes(
			stderr,
			'[!] (plugin at position 1) Error: My error.\n' +
				'main.js\ncustom code frame\n' +
				'    at Object.'
		);
		assertIncludes(stderr, 'rollup.config.js:9:19');
	}
});
