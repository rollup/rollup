module.exports = defineTest({
	description:
		'does not avoid separate chunks if too many modules dynamically import the same chunk',
	options: {
		input: ['main1', 'main2', 'main3', 'main4']
	}
});
