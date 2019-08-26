module.exports = {
	// solo: true,
	description: 're-exports a named external export as default',
	expectedWarnings: ['MIXED_EXPORTS'],
	options: {
		external: ['external'],
		output: {
			globals: { external: 'external' },
			name: 'bundle'
		}
	}
};

// TODO Lukas there seem to be many different interops -> consolidate!
// - function
// - inline
// - inline generating the __default variable
// TODO Lukas also test named and default import from same dependency
// TODO Lukas also test without interop
