module.exports = defineTest({
	description: 'merges treeshake options',
	command:
		'rollup main.js --format es --external external --treeshake.moduleSideEffects no-external --treeshake --no-treeshake.unknownGlobalSideEffects'
});
