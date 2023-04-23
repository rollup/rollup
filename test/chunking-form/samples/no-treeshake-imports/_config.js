module.exports = defineTest({
	description: 'includes all imports when setting moduleSideEffects to "no-treeshake"',
	options: {
		input: ['main1', 'main2'],
		plugins: {
			transform(code, id) {
				if (id.includes('main')) {
					return { moduleSideEffects: 'no-treeshake' };
				}
			}
		}
	}
});
