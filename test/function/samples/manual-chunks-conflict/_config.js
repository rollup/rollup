module.exports = defineTest({
	description: 'Throws for conflicts between manual chunks',
	options: {
		input: ['main.js'],
		output: {
			manualChunks: {
				dep1: ['dep.js'],
				dep2: ['dep.js']
			}
		}
	},
	generateError: {
		code: 'INVALID_CHUNK',
		message: 'Cannot assign "dep.js" to the "dep2" chunk as it is already in the "dep1" chunk.'
	}
});
