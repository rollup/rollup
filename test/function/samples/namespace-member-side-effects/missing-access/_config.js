module.exports = defineTest({
	description: 'respects side effects when accessing missing namespace members',
	options: {
		treeshake: { tryCatchDeoptimization: false }
	}
});
