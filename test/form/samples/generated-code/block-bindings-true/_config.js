module.exports = {
	description: 'uses block bindings',
	options: {
		external: ['external'],
		output: {
			generatedCode: { arrowFunctions: true, blockBindings: true },
			name: 'bundle'
		}
	}
};
