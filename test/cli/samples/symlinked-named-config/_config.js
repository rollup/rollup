module.exports = defineTest({
	description: 'loads a symlinked config file with the given name',
	spawnArgs: ['--config', 'my.rollup.config.js', '--bundleConfigAsCjs'],
	execute: true
});
