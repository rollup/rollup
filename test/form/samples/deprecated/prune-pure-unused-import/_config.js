module.exports = {
	description: 'prunes pure unused external imports ([#1352])',
	expectedWarnings: ['EMPTY_BUNDLE'],
	options: {
		strictDeprecations: false,
		external: ['external', 'other'],
		treeshake: { pureExternalModules: true }
	}
};
