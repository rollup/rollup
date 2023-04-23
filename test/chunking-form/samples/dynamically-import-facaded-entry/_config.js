module.exports = defineRollupTest({
	description: 'uses existing entry facades for dynamic imports if present',
	options: {
		input: ['main.js', 'importer.js'],
		preserveEntrySignatures: 'strict'
	}
});
