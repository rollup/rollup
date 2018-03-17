module.exports = {
	description: 'prunes pure unused external imports',
	command: 'rollup main.js --format es --external external --treeshake.pureExternalModules'
};
