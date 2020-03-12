module.exports = {
	description: 'prunes pure unused external imports ([#1352])',
	expectedWarnings: ['DEPRECATED_FEATURE', 'EMPTY_BUNDLE'],
	options: {
		strictDeprecations: false,
		external: ['external', 'other'],
		treeshake: { pureExternalModules: id => id === 'external' },
		output: {
			globals: { other: 'other' }
		}
	}
};
