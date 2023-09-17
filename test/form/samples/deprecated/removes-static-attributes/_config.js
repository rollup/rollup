module.exports = defineTest({
	description: 'keeps any import assertions on input',
	expectedWarnings: ['UNRESOLVED_IMPORT', 'DEPRECATED_FEATURE'],
	options: {
		strictDeprecations: false,
		external: id => {
			if (id === 'unresolved') return null;
			return true;
		},
		output: { name: 'bundle', externalImportAssertions: false }
	}
});
