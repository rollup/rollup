module.exports = defineTest({
	description: 're-exports a named external export as default',
	expectedWarnings: ['MIXED_EXPORTS'],
	options: {
		external: ['external'],
		output: {
			globals: { external: 'external' },
			name: 'bundle'
		}
	}
});
