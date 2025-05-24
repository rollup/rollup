module.exports = defineTest({
	description: 'does not close the watcher when stdin closes to support watch mode in containers',
	spawnScript: 'wrapper.js',
	spawnArgs: ['main.js', '--watch', '--format', 'es', '--file', '_actual/out.js'],
	abortOnStderr(data) {
		if (data.includes('waiting for changes')) {
			return true;
		}
	}
});
