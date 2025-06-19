module.exports = defineTest({
	description: 'allows disabling side-effects when accessing properties',
	spawnArgs: ['main.js', '--format', 'es', '--no-treeshake.propertyReadSideEffects']
});
