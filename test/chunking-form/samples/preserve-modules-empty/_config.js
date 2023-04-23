module.exports = defineTest({
	description: 'Preserve modules remove empty dependencies',
	options: {
		input: 'main.js',
		output: { preserveModules: true }
	}
});
