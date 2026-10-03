module.exports = defineTest({
	description: 'waits for the top-level await of a dynamically imported module when it is inlined',
	formats: ['es'],
	options: {
		output: { inlineDynamicImports: true }
	}
});
