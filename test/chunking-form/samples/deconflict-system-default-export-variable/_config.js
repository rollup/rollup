module.exports = defineTest({
	description: 'deconflicts SystemJS default export variable with namespace imports',
	options: {
		external: 'external',
		output: { preserveModules: true }
	}
});
