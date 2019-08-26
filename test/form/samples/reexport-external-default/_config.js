module.exports = {
	description: 'reexports an external default export',
	options: {
		external: ['external'],
		output: {
			globals: { external: 'external' },
			name: 'bundle'
		}
	}
};
