module.exports = {
	skip: true,
	description: 'allows overriding imports of external namespace reexports',
	options: {
		external: 'external',
		output: {
			name: 'bundle',
			globals: { external: 'external' }
		}
	}
};
