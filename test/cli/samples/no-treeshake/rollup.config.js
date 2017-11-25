module.exports = {
	input: 'main.js',
	indent: true,
	treeshake: {
		propertyReadSideEffects: false
	},
	output: {
		format: 'iife',
		name: 'shakeless'
	}
};
