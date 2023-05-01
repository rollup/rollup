module.exports = defineTest({
	description: 'Rewrite modules in-place',
	options: {
		input: ['main1.js', 'main2.js'],
		output: { preserveModules: true }
	}
});
