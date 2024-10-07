module.exports = defineTest({
	description: 'preserve the object argument',
	context: {
		externalFunc(input) {
			return input;
		}
	}
});
