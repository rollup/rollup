module.exports = defineTest({
	description: 'does not include the interop block',
	spawnArgs: ['-i', 'main.js', '-f', 'cjs', '--external', 'test', '--interop', 'default']
});
