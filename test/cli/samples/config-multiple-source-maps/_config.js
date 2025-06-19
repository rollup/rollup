module.exports = defineTest({
	description: 'correctly generates sourcemaps for multiple outputs',
	spawnArgs: ['-c', '--bundleConfigAsCjs']
});
