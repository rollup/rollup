module.exports = defineTest({
	description: 'disables indentation with --no-indent',
	spawnArgs: ['main.js', '--format', 'umd', '--no-indent']
});
