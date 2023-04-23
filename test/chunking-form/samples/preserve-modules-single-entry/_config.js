module.exports = defineRollupTest({
	description: 'single entry names file correctly',
	options: {
		input: 'main.js',
		output: { preserveModules: true }
	}
});
