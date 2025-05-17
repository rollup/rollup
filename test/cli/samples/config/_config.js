module.exports = defineTest({
	description: 'uses config file',
	spawnArgs: ['--config', 'rollup.config.js'],
	execute: true
});
