module.exports = defineTest({
	description: 'terminates when plugins keep handles open',
	spawnArgs: ['-cw'],
	// On Windows, signals terminate the process directly, so the graceful shutdown path is never taken.
	skipIfWindows: true,
	abortOnStderr(data) {
		if (data.includes('waiting for changes')) {
			return true;
		}
	}
});
