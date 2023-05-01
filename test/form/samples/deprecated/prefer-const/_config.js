module.exports = defineTest({
	description: 'uses const instead of var if specified (#653)',
	options: {
		strictDeprecations: false,
		external: ['other'],
		output: {
			globals: { other: 'other' },
			name: 'myBundle',
			preferConst: true
		}
	},
	expectedWarnings: ['DEPRECATED_FEATURE']
});
