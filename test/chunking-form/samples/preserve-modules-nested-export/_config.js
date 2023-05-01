module.exports = defineTest({
	description: 'confirm exports are preserved when exporting a module',
	options: {
		input: 'main.js',
		output: { preserveModules: true }
	}
});
