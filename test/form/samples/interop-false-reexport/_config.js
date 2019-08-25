module.exports = {
	description: 'reexports with interop: false',
	options: {
		external: ['external'],
		output: {
			globals: { external: 'external' },
			name: 'foo',
			interop: false
		}
	}
};
