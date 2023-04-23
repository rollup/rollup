module.exports = defineTest({
	description: 'chunking compact and mangled output',
	options: {
		input: ['main1.js', 'main2.js'],
		external: ['external'],
		output: {
			compact: true
		}
	}
});
