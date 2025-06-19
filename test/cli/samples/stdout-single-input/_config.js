module.exports = defineTest({
	description: 'bundles a single input to stdout without modifications',
	spawnArgs: ['-i', 'main.js', '-f', 'es', '-m', 'inline']
});
