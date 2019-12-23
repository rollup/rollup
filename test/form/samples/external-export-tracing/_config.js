module.exports = {
	description: 'Support external namespace reexport',
	options: {
		external: ['external'],
		output: {
			globals: { external: 'external' },
			name: 'myBundle'
		}
	}
};
