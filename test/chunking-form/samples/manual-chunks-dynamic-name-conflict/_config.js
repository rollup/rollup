module.exports = {
	description: 'handles name conflicts in manual chunks',
	options: {
		input: ['main.js'],
		manualChunks: {
			dynamic: ['dynamic1.js']
		},
		output: {
			chunkFileNames: 'generated-[name].js'
		}
	}
};
