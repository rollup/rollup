module.exports = defineRollupTest({
	description: 'properly deconflicts default exports when not tree-shaking',
	options: {
		treeshake: false
	}
});
