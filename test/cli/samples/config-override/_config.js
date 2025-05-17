module.exports = defineTest({
	description: 'overrides config file with command line arguments',
	spawnArgs: ['-c', '-i', 'main.js', '-f', 'cjs'],
	execute: true
});
