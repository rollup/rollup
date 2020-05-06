module.exports = {
	description: 'makes existing entries a proper facade if possible when importing dynamically',
	options: {
		input: ['main.js', 'importer.js'],
		preserveEntrySignatures: false
	}
};
