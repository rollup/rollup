module.exports = defineTest({
	description:
		'manual chunks keep all their members when one member is statically and another member is dynamically imported',
	options: {
		input: ['main.js'],
		output: {
			manualChunks: {
				manual: ['mA.js', 'mB.js']
			}
		}
	}
});
