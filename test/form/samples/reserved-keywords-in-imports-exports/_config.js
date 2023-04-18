module.exports = {
	description: 'correctly handles reserved keywords in exports/imports',
	options: {
		input: ['main'],
		output: {
			name: 'reservedKeywords'
		},
		external: ['external']
	}
};
