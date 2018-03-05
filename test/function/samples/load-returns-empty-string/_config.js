module.exports = {
	description: 'loaders are permitted to return the empty string',
	options: {
		plugins: [
			{
				load: function(id) {
					if (/foo\.js/.test(id)) {
						return '';
					}
				}
			},
			{
				load: function(id) {
					if (/bar\.js/.test(id)) {
						return { code: '', map: null };
					}
				}
			}
		]
	}
};
