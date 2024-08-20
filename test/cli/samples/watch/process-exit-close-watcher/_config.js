const { assertIncludes } = require('../../../../utils.js');

module.exports = defineTest({
	// We cannot await async handlers in that case, though
	description:
		'calls synchronous closeWatcher plugin hooks when rollup is terminated via process.exit',
	command: 'rollup -cw',
	error: () => true,
	stderr(stderr) {
		assertIncludes(stderr, 'close watcher');
	}
});
