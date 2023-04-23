module.exports = defineTest({
	description: 'Uses entry point semantics for all files when preserving modules',
	options: {
		input: 'main.js',
		output: { preserveModules: true }
	}
});
