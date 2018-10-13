module.exports = {
	description: 'correctly resolves ids of external dynamic imports (#2481)',
	options: {
		output: { name: 'bundle' },
		external(id) {
			return id.endsWith('external');
		},
		plugins: [
			{
				resolveId(id) {
					if (id === 'external') {
						return '/absolute/path/to/external';
					}
				}
			}
		]
	}
};
