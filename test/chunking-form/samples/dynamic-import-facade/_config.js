module.exports = defineTest({
	description: 'makes sure dynamic chunks are not tainted',
	options: {
		input: ['main1.js', 'main2.js']
	}
});
