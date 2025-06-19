module.exports = defineTest({
	description: 'uses mjs config file which returns a Promise',
	spawnArgs: ['--config', 'rollup.config.mjs'],
	execute: true
});
