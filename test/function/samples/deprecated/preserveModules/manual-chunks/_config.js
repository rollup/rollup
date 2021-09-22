module.exports = {
	description: 'Assigning manual chunks fails when preserving modules',
	options: {
		strictDeprecations: false,
		input: ['main.js'],
		preserveModules: true,
		output: {
			manualChunks: {
				lib: ['lib.js']
			}
		}
	},
	generateError: {
		code: 'INVALID_OPTION',
		message:
			'Invalid value for option "output.manualChunks" - this option is not supported for "output.preserveModules".',
		url: 'https://rollupjs.org/guide/en/#outputmanualchunks'
	}
};
