module.exports = {
	description: 'manual chunks to an empty dynamic chunk',
	_single: true,
	options: {
		input: ['main.js'],
		manualChunks: {
			'dynamic': ['dynamic.js']
		}
	}
};
