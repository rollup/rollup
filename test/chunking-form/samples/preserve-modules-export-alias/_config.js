module.exports = defineRollupTest({
	description: 'confirm export aliases are preserved in modules',
	options: {
		input: ['main1.js', 'main2.js'],
		output: { preserveModules: true }
	}
});
