module.exports = defineTest({
	description: 'uses correct "this" in dynamic imports when not using arrow functions',
	options: {
		external: ['input', 'output'],
		output: {
			dynamicImportInCjs: false,
			generatedCode: { arrowFunctions: false },
			globals: { input: 'input', output: 'output' },
			name: 'bundle'
		}
	}
});
