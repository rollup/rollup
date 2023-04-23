module.exports = defineRollupTest({
	description: 'deactivates try-catch-deoptimization via option',
	options: {
		treeshake: {
			tryCatchDeoptimization: false
		}
	}
});
