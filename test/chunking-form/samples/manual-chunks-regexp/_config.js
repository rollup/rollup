module.exports = defineTest({
	description: 'supports manual chunks with a RegExp',
	options: {
		input: ['main.js'],
		output: {
			manualChunks: {
				dep: [/dep-a.*2\.js$/]
			}
		}
	}
});
