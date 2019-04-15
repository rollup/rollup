// TODO Lukas test that we can have different manual chunks nested in each other
// TODO Lukas test that we create facades if a manual chunk contains an entry point with a different alias
module.exports = {
	description: 'Throws for conflicts between manual chunks and inputs if the alias does not match',
	options: {
		input: {
			main: 'main.js'
		},
		manualChunks: {
			other: ['main.js']
		}
	},
	error: {
		code: 'INVALID_CHUNK',
		message: `Cannot assign main.js to the "main" chunk as it is already in the "other" chunk.`
	}
};
