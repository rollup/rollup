module.exports = defineTest({
	description: 'watches using a node_modules config files',
	spawnArgs: ['--watch', '--config', 'node:custom'],
	abortOnStderr(data) {
		if (data.includes(`created _actual/main.js`)) {
			return true;
		}
	}
});
