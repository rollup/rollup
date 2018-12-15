module.exports = {
	description: 'supports dynamic manual chunks',
	options: {
		input: ['main.js'],
		manualChunks: {
			dynamic: ['dynamic.js']
		}
	}
};
