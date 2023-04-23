module.exports = defineTest({
	description: 'Preserve modules properly handles internal namespace imports (#2576)',
	options: {
		input: ['main.js'],
		output: { preserveModules: true }
	}
});
