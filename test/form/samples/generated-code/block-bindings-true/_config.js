module.exports = {
	description: 'uses block bindings',
	options: {
		external: ['external'],
		shimMissingExports: true,
		output: {
			generatedCode: { arrowFunctions: true, blockBindings: true },
			name: 'bundle',
			noConflict: true
		}
	}
};
