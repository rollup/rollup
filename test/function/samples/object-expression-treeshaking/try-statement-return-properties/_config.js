module.exports = defineTest({
	description: 'includes properties of return statements in try statements',
	options: {
		treeshake: {
			tryCatchDeoptimization: true
		}
	}
});
