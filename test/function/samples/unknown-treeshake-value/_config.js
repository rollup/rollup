module.exports = {
	// solo: true,
	description: 'throws for unknown string values for the treeshake option',
	options: {
		treeshake: 'some-string'
	},
	error: {
		code: 'INVALID_OPTION',
		message:
			'Invalid value for option "treeshake" - please use either "recommended", "safest", "smallest", false or true.'
	}
};
