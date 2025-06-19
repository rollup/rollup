module.exports = defineTest({
	description: 'sets all tree-shaking to false if one option disables it',
	spawnArgs: [
		'main.js',
		'--format',
		'es',
		'--external',
		'external',
		'--treeshake.moduleSideEffects',
		'no-external',
		'--no-treeshake',
		'--no-treeshake.unknownGlobalSideEffects'
	]
});
