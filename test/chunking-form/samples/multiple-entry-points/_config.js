module.exports = defineTest({
	description: 'handles multiple entry points with a shared dependency',
	options: {
		input: ['main', 'other'],
		output: {
			chunkFileNames: 'chunks/[name].js'
		}
	},
	runAmd: true
});
