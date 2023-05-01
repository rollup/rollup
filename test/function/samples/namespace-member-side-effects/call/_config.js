module.exports = defineTest({
	description: 'checks side effects when calling a namespace',
	options: {
		treeshake: { tryCatchDeoptimization: false }
	}
});
