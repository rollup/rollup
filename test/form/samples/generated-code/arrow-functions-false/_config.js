module.exports = {
	description: 'does not use arrow functions',
	options: {
		external: ['external'],
		output: { generatedCode: { arrowFunctions: false }, name: 'bundle' }
	}
};
