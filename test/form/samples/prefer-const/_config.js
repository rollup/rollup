module.exports = {
	description: 'uses const instead of var if specified (#653)',
	options: {
		external: ['other'],
		output: {
			globals: { other: 'other' },
			name: 'myBundle',
			preferConst: true
		}
	}
};
