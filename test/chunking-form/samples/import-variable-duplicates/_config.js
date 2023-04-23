module.exports = defineTest({
	description: 'chunk duplicate import deshadowing',
	options: {
		input: ['main1.js', 'main2.js', 'first.js', 'head.js']
	}
});
