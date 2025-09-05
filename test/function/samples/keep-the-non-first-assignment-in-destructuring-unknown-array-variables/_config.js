module.exports = defineTest({
	description: 'Keep the non-first assignment in destructuring unknown array variables',
	context: {
		unknownVariable: []
	}
});
