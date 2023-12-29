module.exports = defineTest({
	description: 'properly tree-shakes nested function calls when moduleSideEffects are disabled',
	options: {
		treeshake: {
			moduleSideEffects: false
		}
	}
});
