module.exports = defineTest({
	description: 'handles special shapes of attributes',
	options: {
		external: () => true
	},
	expectedWarnings: ['INVALID_IMPORT_ATTRIBUTE']
});
