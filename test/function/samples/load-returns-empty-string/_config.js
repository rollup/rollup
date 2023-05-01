module.exports = defineTest({
	description: 'loaders are permitted to return the empty string',
	options: {
		plugins: [
			{
				load(id) {
					if (/foo\.js/.test(id)) {
						return '';
					}
				}
			},
			{
				load(id) {
					if (/bar\.js/.test(id)) {
						return { code: '', map: null };
					}
				}
			}
		]
	}
});
