module.exports = defineTest({
	description: 'namespace rendering with reexports',
	options: {
		input: ['main.js', 'hsl2hsv.js', 'index.js'],
		output: {
			exports: 'named'
		}
	}
});
