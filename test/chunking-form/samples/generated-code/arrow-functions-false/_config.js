module.exports = defineTest({
	description: 'does not use arrow functions',
	options: {
		input: ['main', 'main2'],
		output: {
			generatedCode: { arrowFunctions: false }
		}
	}
});
