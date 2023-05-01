module.exports = defineTest({
	description: 'checks side effects when reassigning namespace members',
	options: {
		treeshake: { tryCatchDeoptimization: false }
	}
});
