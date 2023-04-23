module.exports = defineTest({
	description:
		'reexports a an external default as a name and imports another name from that dependency',
	expectedWarnings: ['MIXED_EXPORTS'],
	options: {
		external: ['external'],
		output: {
			globals: { external: 'external' },
			name: 'bundle'
		}
	}
});
