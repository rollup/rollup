module.exports = defineTest({
	description: 'Assigning manual chunks fails when preserving modules',
	options: {
		input: ['main.js'],
		output: {
			manualChunks: {
				lib: ['lib.js']
			},
			preserveModules: true
		}
	},
	generateError: {
		code: 'INVALID_OPTION',
		message:
			'Invalid value for option "output.manualChunks" - this option is not supported for "output.preserveModules".',
		url: 'https://rollupjs.org/configuration-options/#output-manualchunks'
	}
});
