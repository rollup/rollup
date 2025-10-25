module.exports = defineTest({
	description: 'keeps any import attributes on input using import attributes with "with" key',
	expectedWarnings: ['UNRESOLVED_IMPORT'],
	options: {
		external: id => {
			if (id === 'unresolved') return null;
			return true;
		},
		output: {
			globals: id => id,
			importAttributesKey: 'assert',
			name: 'bundle'
		}
	}
});
