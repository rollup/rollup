const { assertIncludes } = require('../../../testHelpers.js');

module.exports = defineTest({
	description: 'warns for circular dependencies',
	spawnArgs: ['-c'],
	stderr(stderr) {
		assertIncludes(stderr, '(!) Circular dependency\nmain.js -> dep.js -> main.js\n');
	}
});
