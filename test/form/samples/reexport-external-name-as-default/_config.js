module.exports = {
	solo: true,
	description: 're-exports a named external export as default',
	options: {
		external: ['external'],
		output: {
			globals: { external: 'external' },
			name: 'bundle'
		}
	}
};
