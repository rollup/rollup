module.exports = defineTest({
	description:
		'splitting module in cycles that is dynamically imported by a module with TLA into a separate chunk',
	formats: ['es', 'system'],
	expectedWarnings: ['CIRCULAR_DEPENDENCY']
});
