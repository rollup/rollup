module.exports = defineRollupTest({
	description: 'reexports a default external import as default export (when using named exports)',
	options: {
		output: {
			globals: { external: 'external' },
			name: 'bundle',
			exports: 'named'
		},
		external: ['external']
	}
});
