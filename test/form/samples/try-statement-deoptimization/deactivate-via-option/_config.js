module.exports = defineTest({
	description: 'deactivates try-catch-deoptimization via option',
	options: {
		treeshake: {
			tryCatchDeoptimization: false
		}
	}
});
