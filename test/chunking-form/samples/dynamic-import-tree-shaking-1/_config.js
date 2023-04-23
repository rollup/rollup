module.exports = defineTest({
	description: 'uses tree-shaking information to improve chunking',
	options: {
		input: {
			entryA: 'main1.js',
			entryB: 'main2.js'
		}
	}
});
