const path = require('path');

module.exports = {
	description: 'normalizes absolute ids',
	options: {
		plugins: [
			{
				transform(code, id) {
					if (/main/.test(id)) {
						return code.replace('"./a.js"', JSON.stringify(path.resolve(__dirname, 'a.js')));
					}
				}
			}
		]
	}
};
