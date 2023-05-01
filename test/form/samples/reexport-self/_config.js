module.exports = defineTest({
	description: 'handles recursions when a module reexports its own namespace',
	expectedWarnings: ['CIRCULAR_DEPENDENCY']
});
