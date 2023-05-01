module.exports = defineTest({
	description: 'sets all tree-shaking to false if one option disables it',
	command:
		'rollup main.js --format es --external external --treeshake.moduleSideEffects no-external --no-treeshake --no-treeshake.unknownGlobalSideEffects'
});
