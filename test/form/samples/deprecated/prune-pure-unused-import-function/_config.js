module.exports = {
	options: {
		strictDeprecations: false,
		external: ['external', 'other'],
		treeshake: { pureExternalModules: id => id === 'external' }
	},
	description: 'prunes pure unused external imports ([#1352])'
};
