module.exports = defineTest({
	description: 'defaults to rollup.config.js',
	spawnArgs: ['-c', '--bundleConfigAsCjs'],
	execute: true
});
