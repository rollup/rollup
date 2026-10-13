module.exports = defineTest({
	description:
		'tree-shakes callbacks of reassigned feature detection helpers when the deoptimization is deactivated',
	options: {
		treeshake: {
			tryCatchDeoptimization: false
		}
	}
});
