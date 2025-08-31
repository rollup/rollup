module.exports = defineTest({
	description: 'Support for bundling config files as cjs which import extensionless files',
	spawnArgs: ['--config', 'rollup.config.mjs', '--bundleConfigAsCjs'],
	execute: false
});
