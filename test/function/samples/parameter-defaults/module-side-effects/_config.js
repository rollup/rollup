module.exports = defineTest({
	description:
		'does not tree-shake necessary parameter defaults when modulesSideEffects are disabled',
	options: {
		treeshake: { moduleSideEffects: false }
	}
});
