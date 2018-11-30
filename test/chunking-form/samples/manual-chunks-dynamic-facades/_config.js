module.exports = {
	description: 'creates facades for dynamic manual chunks if necessary',
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
