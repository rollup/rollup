module.exports = defineTest({
	description: 'allows config file to import json',
	spawnArgs: ['--config', 'rollup.config.js', '--bundleConfigAsCjs'],
	execute: true
});
