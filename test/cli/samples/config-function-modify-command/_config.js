module.exports = defineTest({
	description: 'allows cleaning up and modifying the command args in the config file',
	spawnArgs: ['--config', 'rollup.config.mjs', '--some-option="foo"', '--another-option=42'],
	execute: true
});
