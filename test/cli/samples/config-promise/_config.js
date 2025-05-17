module.exports = defineTest({
	description: 'uses config file which returns a Promise',
	spawnArgs: ['--config', 'rollup.config.mjs'],
	execute: true
});
