module.exports = defineTest({
	description: 'import namespace from chunks with default export mode when preserving modules',
	options: {
		input: ['main', 'lib'],
		output: {
			preserveModules: true
		}
	}
});
