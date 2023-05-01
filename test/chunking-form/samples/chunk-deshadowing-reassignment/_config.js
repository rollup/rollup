module.exports = defineTest({
	description: 'chunk reassignment import deshadowing',
	options: {
		input: ['main1.js', 'main2.js', 'main3.js', 'main4.js']
	}
});
