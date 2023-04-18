module.exports = {
	description: 'correctly handles illegal identifiers in exports/imports',
	options: {
		input: ['main'],
		output: {
			name: 'illegalIdentifiers'
		},
		external: ['external']
	}
};
