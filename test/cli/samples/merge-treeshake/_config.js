module.exports = defineTest({
	description: 'merges treeshake options',
	spawnArgs: [
		'main.js',
		'--format',
		'es',
		'--external',
		'external',
		'--treeshake.moduleSideEffects',
		'no-external',
		'--treeshake',
		'--no-treeshake.unknownGlobalSideEffects'
	]
});
