module.exports = {
	description: 'getInterop with interop: false',
	expectedWarnings: ['UNUSED_EXTERNAL_IMPORT', 'DEPRECATED_FEATURE'],
	options: {
		strictDeprecations: false,
		external: ['core/view'],
		output: {
			globals: { 'core/view': 'View' },
			name: 'foo',
			interop: false
		}
	}
};
