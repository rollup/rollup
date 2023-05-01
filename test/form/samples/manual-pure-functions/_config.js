module.exports = defineTest({
	description: 'allows to manually declare functions as pure by name',
	options: {
		treeshake: { manualPureFunctions: ['foo', 'bar.a'] }
	}
});
