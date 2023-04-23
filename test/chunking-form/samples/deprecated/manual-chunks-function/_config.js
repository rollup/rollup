module.exports = defineTest({
	description: 'allows to define manual chunks via a function',
	options: {
		strictDeprecations: false,
		input: ['main-a'],
		manualChunks(id) {
			if (id[id.length - 5] === '-') {
				return `chunk-${id[id.length - 4]}`;
			}
		}
	},
	expectedWarnings: ['DEPRECATED_FEATURE']
});
