module.exports = defineTest({
	description:
		'handle situations where the simplification of an expression can lead to issues due to missing white-space',
	options: { treeshake: { tryCatchDeoptimization: false } }
});
