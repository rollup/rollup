module.exports = defineTest({
	description: 'Allows omitting the code that handles external live bindings in compact mode',
	options: {
		external: () => true,
		output: {
			globals: {
				external1: 'external1',
				external2: 'external2'
			},
			compact: true,
			externalLiveBindings: false,
			name: 'bundle',
			dynamicImportInCjs: false
		}
	}
});
