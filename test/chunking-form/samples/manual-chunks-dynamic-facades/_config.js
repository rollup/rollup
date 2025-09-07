module.exports = defineTest({
	description: 'creates facades for dynamic manual chunks if necessary',
	options: {
		input: ['main.js'],
		output: {
			manualChunks: {
				dynamic: ['dynamic1.js']
			}
		}
	}
});
