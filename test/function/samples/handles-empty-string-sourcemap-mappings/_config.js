module.exports = defineTest({
	description: 'handles transforms that return sourcemap with empty mappings',

	options: {
		plugins: [
			{
				transform(code) {
					return {
						code,
						map: { mappings: '' }
					};
				}
			}
		],
		// ensure source maps are generated
		output: { sourcemap: true }
	}
});
