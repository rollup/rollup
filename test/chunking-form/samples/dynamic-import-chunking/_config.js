module.exports = defineRollupTest({
	description: 'Code splitting with dynamic import',
	options: {
		input: ['main.js'],
		preserveEntrySignatures: 'strict'
	}
});
