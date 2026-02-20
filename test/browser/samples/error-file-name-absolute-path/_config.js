const { loader } = require('../../../utils.js');

module.exports = {
	description: 'throws when a plugin adds an absolute file name to the output bundle',
	options: {
		plugins: [
			loader({ main: 'export default 42;' }),
			{
				name: 'test',
				generateBundle(_options, bundle) {
					bundle['/etc/passwd'] = {
						type: 'asset',
						fileName: '/etc/passwd',
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
			'The output file name "/etc/passwd" is not contained in the output directory. Make sure all file names are relative paths without ".." segments.'
	}
};
