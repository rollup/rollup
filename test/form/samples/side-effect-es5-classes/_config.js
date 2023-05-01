module.exports = defineTest({
	description: 'omits ES5 classes which are pure (e.g. they only assign to `this`)',
	expectedWarnings: ['THIS_IS_UNDEFINED']
});
