module.exports = defineTest({
	description:
		're-evaluates a condition on a multi-return function when a previously unreached return statement becomes reached (#6491)',
	options: {
		treeshake: {
			propertyReadSideEffects: false
		}
	},
	context: { globalThis: {} }
});
