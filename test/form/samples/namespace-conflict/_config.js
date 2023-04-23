module.exports = defineTest({
	description: 'replaces conflicting namespace properties with undefined',
	expectedWarnings: ['NAMESPACE_CONFLICT', 'MISSING_EXPORT']
});
