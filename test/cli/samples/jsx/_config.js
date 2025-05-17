module.exports = defineTest({
	description: 'supports jsx presets via CLI',
	spawnArgs: ['-i', 'main.js', '--jsx', 'react', '--external', 'react']
});
