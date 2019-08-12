module.exports = {
	options: {
		strictDeprecations: false,
		external: ['external', 'other'],
		treeshake: { pureExternalModules: true }
	},
	description: 'prunes pure unused external imports ([#1352])'
};
