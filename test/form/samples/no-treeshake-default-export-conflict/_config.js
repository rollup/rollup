module.exports = defineTest({
	description: 'properly deconflicts default exports when not tree-shaking',
	options: {
		treeshake: false
	}
});
