module.exports = defineTest({
	description: 'confirm exports are deconflicted when exporting nested index aliases',
	options: {
		input: 'main.js',
		output: { preserveModules: true }
	}
});
