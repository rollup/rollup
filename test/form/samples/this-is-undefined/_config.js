module.exports = defineTest({
	description: 'top-level `this` expression is rewritten as `undefined`',
	expectedWarnings: ['THIS_IS_UNDEFINED']
});
