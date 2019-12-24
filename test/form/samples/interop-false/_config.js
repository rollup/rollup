module.exports = {
	description: 'getInterop with interop: false',
	expectedWarnings: ['UNUSED_EXTERNAL_IMPORT'],
	options: {
		external: ['core/view'],
		output: {
			globals: { 'core/view': 'View' },
			name: 'foo',
			interop: false
		}
	}
};
