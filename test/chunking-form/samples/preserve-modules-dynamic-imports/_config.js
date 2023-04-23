module.exports = defineTest({
	description: 'dynamic imports are handled correctly when preserving modules',
	options: {
		input: ['main.js'],
		output: { preserveModules: true }
	}
});
