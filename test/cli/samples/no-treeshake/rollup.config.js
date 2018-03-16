module.exports = {
	input: 'main.js',
	treeshake: {
		propertyReadSideEffects: false
	},
	output: {
		format: 'iife',
		name: 'shakeless'
	}
};
