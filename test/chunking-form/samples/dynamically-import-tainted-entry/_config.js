module.exports = defineRollupTest({
	description: 'supports dynamically importing entries with additional exports',
	options: {
		input: ['main.js', 'importer.js'],
		preserveEntrySignatures: 'allow-extension'
	}
});
