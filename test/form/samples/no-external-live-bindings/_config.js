module.exports = defineTest({
	description: 'Allows omitting the code that handles external live bindings',
	options: {
		external: () => true,
		output: {
			globals: {
				external1: 'external1',
				external2: 'external2'
			},
			externalLiveBindings: false,
			name: 'bundle',
			dynamicImportInCjs: false
		}
	}
});
