module.exports = defineTest({
	description: 'supports re-exported synthetic exports in namespace objects',
	options: {
		plugins: [
			{
				name: 'test-plugin',
				transform(code, id) {
					if (id.endsWith('synthetic.js')) {
						return {
							code,
							syntheticNamedExports: true
						};
					}
				}
			}
		]
	}
});
