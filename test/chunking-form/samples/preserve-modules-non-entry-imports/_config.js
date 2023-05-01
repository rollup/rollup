module.exports = defineTest({
	description: 'imports and exports of non-entry points are tracked',
	options: {
		input: 'main.js',
		output: { preserveModules: true }
	}
});
