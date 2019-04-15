module.exports = {
	description: 'Throws for conflicts between manual chunks',
	options: {
		input: ['main.js'],
		manualChunks: {
			dep1: ['dep.js'],
			dep2: ['dep.js']
		}
	},
	error: {
		code: 'INVALID_CHUNK',
		message: `Cannot assign dep.js to the "dep1" chunk as it is already in the "dep2" chunk.`
	}
};
