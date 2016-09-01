module.exports = {
	description: 'plugin .transformBundle gets passed options',
	options: {
		plugins: [
			{
				transformBundle: function (code, options) {
					return JSON.stringify(options);
				}
			}
		]
	}
};
