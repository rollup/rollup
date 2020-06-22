module.exports = {
	description: 'supports dynamic manual chunks',
	options: {
		strictDeprecations: false,
		input: ['main.js'],
		manualChunks: {
			dynamic: ['dynamic.js']
		}
	}
};
