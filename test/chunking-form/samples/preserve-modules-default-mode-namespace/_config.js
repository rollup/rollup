module.exports = defineRollupTest({
	description: 'import namespace from chunks with default export mode when preserving modules',
	options: {
		input: ['main', 'lib'],
		output: {
			preserveModules: true
		}
	}
});
