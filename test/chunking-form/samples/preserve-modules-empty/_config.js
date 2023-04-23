module.exports = defineRollupTest({
	description: 'Preserve modules remove empty dependencies',
	options: {
		input: 'main.js',
		output: { preserveModules: true }
	}
});
