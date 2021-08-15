module.exports = {
	description: 'replaces functions with arrow functions',
	options: {
		external: ['external'],
		output: { generatedCode: { arrowFunctions: true }, name: 'bundle' }
	}
};
