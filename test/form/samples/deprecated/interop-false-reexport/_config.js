module.exports = {
	description: 'reexports with interop: false',
	options: {
		strictDeprecations: false,
		external: ['external'],
		output: {
			globals: { external: 'external' },
			name: 'foo',
			interop: false
		}
	},
	expectedWarnings: ['DEPRECATED_FEATURE']
};
