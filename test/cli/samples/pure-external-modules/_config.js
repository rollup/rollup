module.exports = {
	description: 'prunes pure unused external imports',
	command: 'rollup main.js --output.format es --external external --treeshake.pureExternalModules'
};
