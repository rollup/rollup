module.exports = {
	description: 'does not use block bindings',
	options: {
		external: ['external'],
		shimMissingExports: true,
		output: {
			compact: true,
			generatedCode: { arrowFunctions: true, blockBindings: true },
			name: 'bundle',
			noConflict: true
		}
	}
};
