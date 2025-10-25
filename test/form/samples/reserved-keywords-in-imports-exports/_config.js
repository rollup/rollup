module.exports = defineTest({
	description: 'correctly handles reserved keywords in exports/imports',
	options: {
		input: ['main'],
		external: ['external'],
		output: {
			globals: { external: 'external' },
			name: 'reservedKeywords'
		}
	}
});
