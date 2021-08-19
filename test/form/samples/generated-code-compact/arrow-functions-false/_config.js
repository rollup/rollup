module.exports = {
	description: 'does not use arrow functions',
	options: {
		external: ['external'],
		output: {
			compact: true,
			generatedCode: { arrowFunctions: false },
			name: 'bundle'
		}
	}
};
