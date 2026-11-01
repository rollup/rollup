module.exports = defineTest({
	description:
		'in entry mode, manual chunks contain their own dependencies while dependencies shared with entries are extracted into separate chunks',
	options: {
		input: ['main.js', 'main2.js'],
		output: {
			manualChunks: {
				manual: ['m.js']
			}
		}
	}
});
