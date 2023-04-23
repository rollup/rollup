module.exports = defineRollupTest({
	description: 'dedupes external imports',
	options: {
		external: ['external'],
		output: {
			globals: { external: 'external' },
			name: 'myBundle'
		}
	}
});
