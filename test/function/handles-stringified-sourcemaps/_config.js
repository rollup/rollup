module.exports = {
	options: {
		plugins: [
			{
				transform: function ( code ) {
					return {
						code: code,
						map: JSON.stringify({ mappings: '' })
					};
				}
			}
		]
	},

	bundleOptions: {
		sourceMap: true
	}
};
