module.exports = {
	description: 're-exports name from external module',
	options: {
		external: ['external'],
		output: {
			globals: { external: 'external' },
			name: 'myBundle'
		}
	}
};
