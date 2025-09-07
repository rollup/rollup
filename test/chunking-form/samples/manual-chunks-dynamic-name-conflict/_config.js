module.exports = defineTest({
	description: 'handles name conflicts in manual chunks',
	options: {
		input: ['main.js'],
		output: {
			manualChunks: {
				dynamic: ['dynamic1.js']
			}
		}
	}
});
