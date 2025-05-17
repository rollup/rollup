module.exports = defineTest({
	description: 'use no strict option',
	spawnArgs: ['-i', 'main.js', '-f', 'iife', '--no-strict', '--indent']
});
