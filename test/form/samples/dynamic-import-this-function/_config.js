module.exports = defineTest({
	description: 'uses correct "this" in dynamic imports when not using arrow functions',
	options: {
		external: ['input', 'output'],
		output: {
			generatedCode: { arrowFunctions: false },
			name: 'bundle',
			dynamicImportInCjs: false
		}
	}
});
