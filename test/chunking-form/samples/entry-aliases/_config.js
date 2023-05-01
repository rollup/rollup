module.exports = defineTest({
	description: 'alias module dependency inlining',
	options: {
		input: {
			'main1.js': 'main1.js',
			'main1-alias.js': 'main1.js',
			'main2.js': 'main2.js'
		},
		output: {
			entryFileNames: '[name]'
		}
	}
});
