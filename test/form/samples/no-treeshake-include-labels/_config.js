module.exports = defineTest({
	description: 'always includes labels when tree-shaking is turned off (#3473)',
	expectedWarnings: ['CIRCULAR_DEPENDENCY'],
	options: {
		treeshake: false
	}
});
