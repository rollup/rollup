module.exports = defineTest({
	description:
		'if the config file returns a function then this will be called with the command args',
	spawnArgs: ['--config', 'rollup.config.mjs', '--silent'],
	execute: true
});
