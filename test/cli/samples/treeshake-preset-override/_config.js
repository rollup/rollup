module.exports = defineTest({
	description: 'overrides the treeshake option when using presets',
	spawnArgs: [
		'--config',
		'--treeshake',
		'recommended',
		'--treeshake.unknownGlobalSideEffects',
		'--no-treeshake.moduleSideEffects'
	]
});
