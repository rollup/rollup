module.exports = defineTest({
	description: 'prunes pure unused external imports ([#1352])',
	options: {
		external: ['external', 'other'],
		treeshake: { moduleSideEffects: ['other'] },
		output: {
			globals: { other: 'other' }
		}
	}
});
