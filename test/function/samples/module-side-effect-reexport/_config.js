module.exports = defineTest({
	description: 'includes side effects of re-exporters unless they have moduleSideEffects: false',
	options: {
		plugins: [
			{
				name: 'ignore-side-effects',
				transform(_code, id) {
					return { moduleSideEffects: id.endsWith('effect.js') };
				}
			}
		]
	}
});
