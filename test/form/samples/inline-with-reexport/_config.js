module.exports = defineTest({
	description: 'handles inlining dynamic imports when the imported module contains reexports',
	options: {
		output: {
			inlineDynamicImports: true
		}
	}
});
