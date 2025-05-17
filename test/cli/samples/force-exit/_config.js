module.exports = defineTest({
	description: 'force exits even with open handles',
	spawnArgs: ['--config', 'rollup.config.js', '--forceExit']
});
