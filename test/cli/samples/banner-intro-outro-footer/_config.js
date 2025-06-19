module.exports = defineTest({
	description: 'adds banner/intro/outro/footer',
	spawnArgs: [
		'-i',
		'main.js',
		'-f',
		'iife',
		'--indent',
		'--banner',
		'// banner',
		'--intro',
		'// intro',
		'--outro',
		'// outro',
		'--footer',
		'// footer'
	]
});
