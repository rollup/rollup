module.exports = {
	description: 'manual chunks to an empty dynamic chunk',

	// manual chunks which are also dynamic entry points do not work yet
	skip: true,
	options: {
		input: ['main.js'],
		manualChunks: {
			dynamic: ['dynamic.js']
		},
		output: {
			chunkFileNames: 'generated-[name].js'
		}
	}
};
