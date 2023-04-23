module.exports = defineTest({
	description: 'warns for invalid options',
	options: {
		treeshake: {
			moduleSideEffects: 'what-is-this?'
		}
	},
	error: {
		code: 'INVALID_OPTION',
		message:
			'Invalid value for option "treeshake.moduleSideEffects" - please use one of false, "no-external", a function or an array.',
		url: 'https://rollupjs.org/configuration-options/#treeshake-modulesideeffects'
	}
});
