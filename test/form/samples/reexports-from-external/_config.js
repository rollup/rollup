module.exports = {
	description: 're-exports * from external module (#791)',
	options: {
		external: ['external'],
		output: {
			globals: { external: 'external' },
			name: 'myBundle'
		}
	}
};
