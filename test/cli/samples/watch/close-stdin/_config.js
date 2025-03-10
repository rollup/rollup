module.exports = defineTest({
	description: 'does not close the watcher when stdin closes to support watch mode in containers',
	command: 'node wrapper.js main.js --watch --format es --file _actual/out.js',
	abortOnStderr(data) {
		if (data.includes('waiting for changes')) {
			return true;
		}
	}
});
