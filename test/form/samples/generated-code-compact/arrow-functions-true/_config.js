module.exports = {
	description: 'replaces functions with arrow functions',
	options: {
		external: ['external'],
		output: {
			compact: true,
			generatedCode: { arrowFunctions: true },
			name: 'bundle'
		}
	}
};
