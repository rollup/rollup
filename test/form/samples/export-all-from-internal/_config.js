module.exports = defineTest({
	description: 'should be able to export * from the bundle',
	options: { output: { name: 'exposedInternals' } }
});
