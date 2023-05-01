module.exports = defineTest({
	description: 'make sure "this" respects the context for arrow functions',
	expectedWarnings: ['THIS_IS_UNDEFINED']
});
