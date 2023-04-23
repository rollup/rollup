module.exports = defineRollupTest({
	description: 'respects side effects when accessing missing namespace members',
	options: {
		treeshake: { tryCatchDeoptimization: false }
	}
});
