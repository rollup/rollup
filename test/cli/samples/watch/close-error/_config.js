module.exports = defineTest({
	description: 'displays errors when closing the watcher',
	command: 'rollup -cw',
	abortOnStderr(data) {
		if (data.includes('[!] (plugin faulty-close) Error: Close bundle failed')) {
			return true;
		}
	}
});
