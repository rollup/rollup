module.exports = defineRollupTest({
	description: 'allows disabling side-effects when accessing properties',
	command: 'rollup main.js --format es --no-treeshake.propertyReadSideEffects'
});
