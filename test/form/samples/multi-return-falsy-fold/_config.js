module.exports = defineTest({
	description:
		'removes a branch when all returns of a function are falsy even if one return value is only known to be falsy (#6491)',
	expectedWarnings: ['EMPTY_BUNDLE']
});
