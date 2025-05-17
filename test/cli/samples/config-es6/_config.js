module.exports = defineTest({
	description: 'uses ES6 module config file',
	spawnArgs: ['--config', 'rollup.config.js', '--bundleConfigAsCjs'],
	execute: true
});
