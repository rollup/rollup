module.exports = {
	// solo: true,
	description: 'reexports a default external import as default export (when using named exports)',
	options: {
		output: {
			globals: { external: 'external' },
			name: 'bundle',
			exports: 'named'
		},
		external: ['external']
	}
};
