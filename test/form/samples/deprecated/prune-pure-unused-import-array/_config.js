module.exports = {
	description: 'prunes pure unused external imports ([#1352])',
	expectedWarnings: ['DEPRECATED_FEATURE'],
	options: {
		strictDeprecations: false,
		external: ['external', 'other'],
		treeshake: { pureExternalModules: ['external'] },
		output: {
			globals: { other: 'other' }
		}
	}
};
