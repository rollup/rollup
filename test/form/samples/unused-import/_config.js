module.exports = defineRollupTest({
	description: 'excludes unused imports ([#595])',
	options: {
		external: ['external'],
		output: {
			globals: { external: 'external' }
		}
	}
});
