module.exports = {
	description: 'handles transforms that return stringified source maps (#377)',

	options: {
		plugins: [
			{
				transform: function(code) {
					return {
						code: code,
						// just stringify an otherwise acceptable source map
						map: JSON.stringify({ mappings: '' })
					};
				}
			}
		]
	},

	// ensure source maps are generated
	bundleOptions: {
		sourcemap: true
	}
};
