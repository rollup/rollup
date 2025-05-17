const { assertIncludes } = require('../../../testHelpers.js');

module.exports = defineTest({
	description: 'warns for multiple circular dependencies',
	spawnArgs: ['-c'],
	stderr: stderr =>
		assertIncludes(
			stderr,
			'(!) Circular dependencies\n' +
				'main.js -> dep1.js -> main.js\n' +
				'main.js -> dep2.js -> main.js\n' +
				'main.js -> dep3.js -> main.js\n' +
				'...and 3 more\n' +
				''
		)
});
