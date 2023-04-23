module.exports = defineTest({
	description: 'allows to force the minification of internal exports',
	options: {
		input: ['main1.js', 'main2.js'],
		output: {
			minifyInternalExports: true
		}
	}
});
