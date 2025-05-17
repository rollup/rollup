module.exports = defineTest({
	description: 'overrides the generatedCode option when using presets',
	spawnArgs: ['--config', '--generatedCode', 'es5', '--generatedCode.arrowFunctions']
});
