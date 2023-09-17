module.exports = defineTest({
	description: 'keeps any import attributes on input',
	expectedWarnings: ['UNRESOLVED_IMPORT'],
	options: {
		external: id => {
			if (id === 'unresolved') return null;
			return true;
		},
		output: { name: 'bundle' }
	}
});
