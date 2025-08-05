module.exports = defineTest({
	description:
		'it does static optimization of internal namespaces when checking whether an export exists',
	expectedWarnings: [
		// That's a bit of an annoyance that Rollup still complains despite the if gate...
		'MISSING_EXPORT'
	]
});
