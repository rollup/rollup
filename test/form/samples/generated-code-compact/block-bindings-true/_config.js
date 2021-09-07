module.exports = {
	description: 'uses block bindings',
	options: {
		external: ['external'],
		output: {
			compact: true,
			generatedCode: { arrowFunctions: true, blockBindings: true },
			name: 'bundle'
		}
	}
};
