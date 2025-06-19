module.exports = defineTest({
	description: 'basic CLI --plugin functionality',
	spawnArgs: ['main.js', '-f', 'cjs', '--plugin', '@rollup/plugin-buble']
});
