module.exports = {
	description: 'throws when using both the file and the dir option',
	options: {
		output: { file: 'bundle.js', dir: 'dist' }
	},
	generateError: {
		code: 'INVALID_OPTION',
		message:
			'You must set either "output.file" for a single-file build or "output.dir" when generating multiple chunks.'
	}
};
