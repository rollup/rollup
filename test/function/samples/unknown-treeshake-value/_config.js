module.exports = {
	description: 'throws for unknown string values for the treeshake option',
	options: {
		treeshake: 'some-string'
	},
	error: {
		code: 'INVALID_OPTION',
		message:
			'Invalid value for option "treeshake" - valid values are false, true, "recommended", "safest" and "smallest". You can also supply an object for more fine-grained control.'
	}
};
