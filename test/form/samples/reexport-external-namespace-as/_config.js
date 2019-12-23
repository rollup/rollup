module.exports = {
	description: 'reexport external namespace as name',
	options: {
		external: 'external',
		output: {
			name: 'bundle',
			globals: { external: 'external' }
		}
	}
};
