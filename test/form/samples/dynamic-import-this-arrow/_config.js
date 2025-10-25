module.exports = defineTest({
	description: 'uses correct "this" in dynamic imports when using arrow functions',
	options: {
		external: ['input', 'output'],
		output: {
			dynamicImportInCjs: false,
			generatedCode: { arrowFunctions: true },
			globals: { input: 'input', output: 'output' },
			name: 'bundle'
		}
	}
});
