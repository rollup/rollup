module.exports = defineRollupTest({
	description: 'Does not create a facade for exports-only if there are no exports',
	options: {
		preserveEntrySignatures: 'exports-only'
	}
});
