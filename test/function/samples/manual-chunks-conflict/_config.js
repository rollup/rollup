const path = require('path');

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
		message: `Cannot assign dep.js to the "dep2" chunk as it is already in the "dep1" chunk.`,
		watchFiles: [path.resolve(__dirname, 'main.js'), path.resolve(__dirname, 'dep.js')]
	}
};
