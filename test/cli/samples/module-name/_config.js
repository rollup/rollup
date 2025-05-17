module.exports = defineTest({
	description: 'generates UMD export with correct name',
	spawnArgs: ['main.js', '--format', 'umd', '--name', 'myBundle', '--indent']
});
