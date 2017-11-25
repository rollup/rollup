module.exports = {
	description: 'allows disabling side-effects when accessing properties',
	command: 'rollup main.js --output.format es --no-treeshake.propertyReadSideEffects'
};
