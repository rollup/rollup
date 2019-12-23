module.exports = {
	description: 'compact output with compact: true',
	expectedWarnings: ['CIRCULAR_DEPENDENCY'],
	options: {
		external: ['external'],
		output: {
			name: 'foo',
			compact: true,
			namespaceToStringTag: true,
			globals: {
				external: 'x'
			}
		}
	}
};
