module.exports = defineTest({
	description: 'respects "named" export mode in all chunks when preserving modules',
	options: {
		input: 'main.js',
		output: {
			exports: 'named',
			preserveModules: true
		}
	}
});
