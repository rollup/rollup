module.exports = {
	description: 'overrides the treeshake option when using presets',
	command:
		'rollup --config --treeshake recommended --treeshake.unknownGlobalSideEffects --no-treeshake.moduleSideEffects'
};
