module.exports = defineTest({
	description: 'throws when using only amd.basePath option',
	options: {
		output: {
			dir: 'dist',
			amd: {
				// @ts-expect-error expected error
				basePath: 'a'
			}
		}
	},
	generateError: {
		code: 'INVALID_OPTION',
		message:
			'Invalid value for option "output.amd.basePath" - this option only works with "output.amd.autoId".',
		url: 'https://rollupjs.org/configuration-options/#output-amd-basepath'
	}
});
