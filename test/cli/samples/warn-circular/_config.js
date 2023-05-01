const { assertIncludes } = require('../../../utils.js');

module.exports = defineTest({
	description: 'warns for circular dependencies',
	command: 'rollup -c',
	stderr(stderr) {
		assertIncludes(stderr, '(!) Circular dependency\nmain.js -> dep.js -> main.js\n');
	}
});
