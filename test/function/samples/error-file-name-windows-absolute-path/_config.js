module.exports = defineTest({
	description: 'throws when a plugin adds a Windows-style absolute file name to the output bundle',
	options: {
		plugins: [
			{
				name: 'test',
				generateBundle(_options, bundle) {
					bundle['C:\\etc\\passwd'] = {
						type: 'asset',
						fileName: 'C:\\etc\\passwd',
						name: undefined,
						needsCodeReference: false,
						names: [],
						originalFileNames: [],
						source: 'injected'
					};
				}
			}
		]
	},
	generateError: {
		code: 'FILE_NAME_OUTSIDE_OUTPUT_DIRECTORY',
		message:
			'The output file name "C:\\etc\\passwd" is not contained in the output directory. Make sure all file names are relative paths without ".." segments.'
	}
});
