module.exports = {
	description: 're-exports a default external import as default export (when using named exports)',
	options: {
		output: {
			globals: { external: 'external' },
			name: 'reexportsDefaultExternalAsDefault',
			exports: 'named'
		},
		external: ['external']
	}
};
