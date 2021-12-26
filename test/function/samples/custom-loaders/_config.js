const { readFileSync } = require('fs');

module.exports = {
	description: 'uses custom loaders, falling back to default',
	options: {
		plugins: [
			{
				load(id) {
					if (/foo\.js/.test(id)) {
						return readFileSync(id, 'utf-8').replace('@', 1);
					}
				}
			},
			{
				load(id) {
					if (/bar\.js/.test(id)) {
						return readFileSync(id, 'utf-8').replace('@', 2);
					}
				}
			}
		]
	}
};
