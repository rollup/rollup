module.exports = {
	description: 'Allows entry chunks with names to be manual chunks if the name matches',
	options: {
		input: {
			main: 'main1.js',
			other: 'main2.js'
		},
		manualChunks: {
			main: ['main1.js']
		}
	}
};
