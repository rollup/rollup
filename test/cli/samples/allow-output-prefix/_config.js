module.exports = defineTest({
	description: 'allows output options to be prefixed with "output."',
	spawnArgs: ['main.js', '--output.format', 'es', '--output.footer', "console.log('Rollup!')"]
});
