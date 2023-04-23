module.exports = defineTest({
	description: 'Manual chunks are not supported when inlining dynamic imports',
	options: {
		strictDeprecations: false,
		input: ['main.js'],
		inlineDynamicImports: true,
		manualChunks: {
			lib: ['lib.js']
		}
	},
	generateError: {
		code: 'INVALID_OPTION',
		message:
			'Invalid value for option "output.manualChunks" - this option is not supported for "output.inlineDynamicImports".',
		url: 'https://rollupjs.org/configuration-options/#output-manualchunks'
	},
	warnings: []
});
