module.exports = {
	description: 're-exports a default import',
	options: {
		output: {
			globals: { external: 'external' },
			name: 'reexportsDefaultExternal'
		},
		external: ['external']
	}
};
