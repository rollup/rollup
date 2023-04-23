module.exports = defineTest({
	description: 'uses arrow functions',
	options: {
		input: ['main', 'main2'],
		output: {
			generatedCode: { arrowFunctions: true }
		}
	}
});
