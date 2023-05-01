module.exports = defineTest({
	description: 'change the module destination',
	options: {
		input: 'src/lib/main.js',
		output: { preserveModules: true }
	}
});
