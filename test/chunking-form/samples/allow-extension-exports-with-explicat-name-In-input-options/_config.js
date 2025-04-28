module.exports = defineTest({
	description: 'generate a separate chunk for the entry module with explicit name in input options',
	options: {
		input: {
			main: './main.js',
			otherEntry: './otherEntry.js'
		},
		preserveEntrySignatures: 'allow-extension'
	}
});
