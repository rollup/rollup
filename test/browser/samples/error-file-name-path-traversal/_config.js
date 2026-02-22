const { loader } = require('../../../utils.js');

module.exports = {
	description: 'throws when a plugin adds a path traversal file name to the output bundle',
	options: {
		plugins: [
			loader({ main: 'export default 42;' }),
			{
				name: 'test',
				generateBundle(_options, bundle) {
					bundle['a/../../escaped.js'] = {
						type: 'asset',
						fileName: 'a/../../escaped.js',
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
			'The output file name "a/../../escaped.js" is not contained in the output directory. Make sure all file names are relative paths without ".." segments.'
	}
};
