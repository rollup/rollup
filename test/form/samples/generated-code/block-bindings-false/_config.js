module.exports = {
	description: 'does not use block bindings',
	options: {
		external: ['external'],
		shimMissingExports: true,
		output: {
			generatedCode: { arrowFunctions: true, blockBindings: false },
			name: 'bundle',
			noConflict: true
		}
	}
};
