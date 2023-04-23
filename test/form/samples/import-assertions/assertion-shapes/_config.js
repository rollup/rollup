module.exports = defineRollupTest({
	description: 'handles special shapes of assertions',
	expectedWarnings: 'UNRESOLVED_IMPORT',
	options: {
		external: () => true
	}
});
