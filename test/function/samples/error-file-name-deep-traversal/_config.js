module.exports = defineTest({
	description:
		'throws when a file name resolves outside the output directory after normalizing deep ".." segments',
	options: {
		plugins: [
			{
				name: 'test',
				generateBundle(_options, bundle) {
					bundle['a/b/../../../escape.js'] = {
						type: 'asset',
						fileName: 'a/b/../../../escape.js',
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
			'The output file name "a/b/../../../escape.js" is not contained in the output directory. Make sure all file names are relative paths without ".." segments.'
	}
});
