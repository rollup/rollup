module.exports = {
	description: 'warns for invalid options',
	options: {
		treeshake: {
			moduleSideEffects: 'what-is-this?'
		}
	},
	error: {
		code: 'INVALID_OPTION',
		message:
			'Invalid value for option "treeshake.moduleSideEffects" - please use one of false, "no-external", a function or an array.'
	}
};
