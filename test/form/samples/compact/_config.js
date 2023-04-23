module.exports = defineTest({
	description: 'supports compact output with compact: true',
	expectedWarnings: ['CIRCULAR_DEPENDENCY'],
	options: {
		external: ['external'],
		output: {
			name: 'foo',
			compact: true,
			generatedCode: { symbols: true },
			globals: {
				external: 'x'
			}
		}
	}
});
