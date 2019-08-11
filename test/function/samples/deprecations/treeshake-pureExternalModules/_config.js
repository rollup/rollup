module.exports = {
	description: 'marks the treeshake.pureExternalModules option as deprecated',
	options: {
		treeshake: { pureExternalModules: true }
	},
	error: {
		code: 'DEPRECATED_FEATURE',
		message: `The "treeshake.pureExternalModules" option is deprecated. The "treeshake.moduleSideEffects" option should be used instead. "treeshake.pureExternalModules: true" is equivalent to "treeshake.moduleSideEffects: 'no-external'"`
	}
};
