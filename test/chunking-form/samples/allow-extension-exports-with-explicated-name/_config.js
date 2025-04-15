module.exports = defineTest({
	description: 'generate the separate chunk for the entry module with explicated chunk name',
	options: {
		input: {
			main: './main.js',
			otherEntry: './otherEntry.js'
		},
		preserveEntrySignatures: 'allow-extension'
	}
});
