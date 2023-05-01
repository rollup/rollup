const { readFileSync } = require('node:fs');

module.exports = defineTest({
	description: 'uses custom loaders, falling back to default',
	options: {
		plugins: [
			{
				load(id) {
					if (/foo\.js/.test(id)) {
						return readFileSync(id, 'utf8').replace('@', 1);
					}
				}
			},
			{
				load(id) {
					if (/bar\.js/.test(id)) {
						return readFileSync(id, 'utf8').replace('@', 2);
					}
				}
			}
		]
	}
});
