const path = require('node:path');

module.exports = defineTest({
	solo: true,
	description: 'normalizes absolute ids',
	options: {
		plugins: [
			{
				name: 'test',
				transform(code, id) {
					if (/main/.test(id)) {
						return code.replace('"./a.js"', JSON.stringify(path.resolve(__dirname, 'a.js')));
					}
				}
			}
		]
	}
});
