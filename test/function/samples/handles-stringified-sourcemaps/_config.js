module.exports = defineTest({
	description: 'handles transforms that return stringified source maps (#377)',

	options: {
		plugins: [
			{
				transform(code) {
					return {
						code,
						// just stringify an otherwise acceptable source map
						map: JSON.stringify({ mappings: '' })
					};
				}
			}
		],
		// ensure source maps are generated
		output: { sourcemap: true }
	}
});
