module.exports = defineTest({
	description: 'prunes pure unused external imports ([#1352])',
	expectedWarnings: ['EMPTY_BUNDLE'],
	options: {
		external: ['external', 'other'],
		treeshake: { moduleSideEffects: id => id !== 'external' },
		output: {
			globals: { other: 'other' }
		}
	}
});
