module.exports = {
	description: 'manual chunks can contain nested modules',
	options: {
		input: ['main.js'],
		output: {
			manualChunks: {
				manual: ['middle.js', 'inner.js', 'outer.js']
			}
		}
	}
};
