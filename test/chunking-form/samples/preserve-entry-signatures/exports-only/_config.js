module.exports = defineTest({
	description: 'Creates a facade if necessary for exports-only if there are exports',
	options: {
		preserveEntrySignatures: 'exports-only'
	}
});
