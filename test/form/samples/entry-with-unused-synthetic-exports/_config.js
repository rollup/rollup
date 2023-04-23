module.exports = defineTest({
	description: 'does not include unused synthetic namespace object in entry points',
	options: {
		plugins: {
			name: 'test-plugin',
			transform(code) {
				return { code, syntheticNamedExports: '__moduleExports' };
			}
		}
	}
});
