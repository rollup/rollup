module.exports = defineTest({
	description: 'external option gets passed from config',
	spawnArgs: ['-c', '-e', 'assert,external-module']
});
