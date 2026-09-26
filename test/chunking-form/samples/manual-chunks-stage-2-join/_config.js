module.exports = defineTest({
	description:
		'in entry mode, modules that are only co-loaded with manual chunk members after dynamic entry removal join the manual chunk',
	options: {
		input: ['main.js'],
		output: {
			manualChunks: {
				manual: ['m.js']
			}
		}
	}
});
