module.exports = defineTest({
	description: 'loads a symlinked config file',
	spawnArgs: ['-c', '--bundleConfigAsCjs'],
	execute: true
});
