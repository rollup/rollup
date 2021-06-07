export default {
	input: 'main.js',
	treeshake: {
		unknownGlobalSideEffects: false,
		tryCatchDeoptimization: false
	},
	output: {
		format: 'es'
	}
}