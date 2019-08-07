module.exports = {
	solo: true,
	description: 're-exports a named external export as default via another file',
	options: {
		external: ['external'],
		output: {
			globals: { external: 'external' },
			name: 'bundle'
		}
	}
};
