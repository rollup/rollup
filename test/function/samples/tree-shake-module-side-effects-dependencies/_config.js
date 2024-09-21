module.exports = defineTest({
	description: 'includes impure dependencies of modules without side effects',
	options: {
		treeshake: {
			moduleSideEffects: id => id.endsWith('effect.js')
		}
	}
});
