module.exports = {
	description: 'throws when generating multiple chunks for an IIFE build',
	options: {
		output: { format: 'iife' }
	},
	generateError: {
		code: 'INVALID_OPTION',
		message: 'UMD and IIFE output formats are not supported for code-splitting builds.'
	}
};
