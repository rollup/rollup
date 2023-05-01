module.exports = defineTest({
	description: 'marks the "manualChunks" input option as deprecated',
	options: {
		manualChunks() {
			return 'manual';
		}
	},
	error: {
		code: 'DEPRECATED_FEATURE',
		message:
			'The "manualChunks" option is deprecated. Use the "output.manualChunks" option instead.',
		url: 'https://rollupjs.org/configuration-options/#output-manualchunks'
	}
});
