module.exports = {
	options: {
		external: ['external', 'other'],
		treeshake: { pureExternalModules: ['external'] }
	},
	description: 'prunes pure unused external imports ([#1352])'
};
