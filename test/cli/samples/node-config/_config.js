module.exports = defineTest({
	description: 'uses config file installed from npm',
	spawnArgs: ['--config', 'node:bar'],
	cwd: __dirname,
	execute: true
});
