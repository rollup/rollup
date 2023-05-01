module.exports = defineTest({
	description: 'supports namespaces with external star reexports',
	options: {
		external: ['external1', 'external2'],
		plugins: {
			transform(code, id) {
				if (id.endsWith('override.js')) {
					return {
						code,
						syntheticNamedExports: true
					};
				}
				return null;
			}
		},
		output: {
			globals: {
				external1: 'external1',
				external2: 'external2'
			},
			name: 'bundle'
		}
	}
});
