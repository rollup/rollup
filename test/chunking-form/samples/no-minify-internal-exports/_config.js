module.exports = defineTest({
	description: 'allows to disable the minification of internal exports',
	options: {
		input: ['main1.js', 'main2.js'],
		output: {
			minifyInternalExports: false
		}
	}
});
