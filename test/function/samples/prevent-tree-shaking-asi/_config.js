module.exports = defineTest({
	description: 'prevent automatic semicolon insertion from changing behaviour when tree-shaking',
	options: {
		treeshake: { tryCatchDeoptimization: false }
	}
});
