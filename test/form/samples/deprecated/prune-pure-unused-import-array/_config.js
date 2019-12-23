module.exports = {
	description: 'prunes pure unused external imports ([#1352])',
	options: {
		strictDeprecations: false,
		external: ['external', 'other'],
		treeshake: { pureExternalModules: ['external'] },
		output: {
			globals: { other: 'other' }
		}
	}
};
