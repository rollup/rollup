module.exports = defineTest({
	description: 'preserves source phase import externals',
	formats: ['es'],
	options: {
		external: ['./dep1.js'] // dep2 tested as implicit external
	},
	expectedWarnings: ['UNRESOLVED_IMPORT']
});
