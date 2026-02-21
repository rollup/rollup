module.exports = defineTest({
	description: 'throws when a plugin sets a safe bundle key but an escaping fileName property',
	options: {
		plugins: [
			{
				name: 'test',
				generateBundle(_options, bundle) {
					bundle['safe.js'] = {
						type: 'asset',
						fileName: '../escaped.js',
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
			'The output file name "../escaped.js" is not contained in the output directory. Make sure all file names are relative paths without ".." segments.'
	}
});
