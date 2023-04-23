module.exports = defineRollupTest({
	description: 'supports dynamic manual chunks',
	options: {
		input: ['main.js'],
		output: {
			manualChunks: {
				dynamic: ['dynamic.js']
			}
		}
	}
});
