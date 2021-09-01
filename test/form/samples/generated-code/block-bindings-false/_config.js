module.exports = {
	description: 'does not use block bindings',
	options: {
		external: ['external'],
		output: {
			generatedCode: { arrowFunctions: true, blockBindings: false },
			name: 'bundle'
		}
	}
};
