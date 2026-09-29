module.exports = defineTest({
	description: 'keeps the arguments side effects of calls to unresolvable properties',
	expectedWarnings: ['MISSING_EXPORT']
});
