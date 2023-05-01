module.exports = defineTest({
	description: 'supports dynamically importing entries with additional exports',
	options: {
		input: ['main.js', 'importer.js'],
		preserveEntrySignatures: false
	}
});
