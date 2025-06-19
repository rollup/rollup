module.exports = defineTest({
	description: 'uses cjs config file which returns a Promise',
	spawnArgs: ['--config', 'rollup.config.cjs'],
	execute: true
});
