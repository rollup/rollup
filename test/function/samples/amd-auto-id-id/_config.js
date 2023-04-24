// @ts-check

module.exports = defineTest({
	description: 'throws when using both the amd.autoId and the amd.id option',
	options: {
		output: {
			dir: 'dist',
			amd: {
				// @ts-expect-error expected error
				autoId: 'a',
				id: 'a'
			}
		}
	},
	generateError: {
		code: 'INVALID_OPTION',
		message:
			'Invalid value for option "output.amd.id" - this option cannot be used together with "output.amd.autoId"/"output.amd.basePath".',
		url: 'https://rollupjs.org/configuration-options/#output-amd-id'
	}
});
