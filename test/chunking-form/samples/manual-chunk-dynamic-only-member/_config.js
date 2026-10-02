module.exports = defineTest({
	description:
		'a manual chunk member that is only dynamically imported does not spawn a separate dynamic chunk',
	options: {
		input: ['main.js'],
		output: {
			manualChunks: {
				manual: ['mA.js']
			}
		}
	}
});
