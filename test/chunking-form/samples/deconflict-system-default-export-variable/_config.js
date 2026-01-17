module.exports = defineTest({
	description: 'deconflicts SystemJS default export variable with namespace imports',
	options: {
		output: { preserveModules: true }
	}
});
