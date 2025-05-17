module.exports = defineTest({
	description: 'uses config file (.mjs)',
	spawnArgs: ['--config', 'rollup.config.mjs'],
	execute: true
});
