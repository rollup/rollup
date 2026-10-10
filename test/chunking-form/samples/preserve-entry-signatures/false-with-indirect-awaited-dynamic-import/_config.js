module.exports = defineTest({
	description:
		'does not create a cycle by merging a shared dependency into an entry with an indirect awaited dynamic import (#5922)',
	formats: ['es', 'system'],
	options: {
		preserveEntrySignatures: false
	}
});
