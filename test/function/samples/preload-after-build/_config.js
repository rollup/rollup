const path = require('node:path');

module.exports = defineTest({
	description: 'supports this.load() in buildEnd and renderStart',
	options: {
		plugins: [
			{
				name: 'test',
				buildEnd() {
					this.load({ id: path.join(__dirname, 'other2.js') });
				},
				moduleParsed({ id }) {
					if (id.endsWith('main.js')) {
						this.load({ id: path.join(__dirname, 'other1.js') });
					}
				},
				renderStart() {
					this.load({ id: path.join(__dirname, 'other3.js') });
				}
			}
		]
	}
});
