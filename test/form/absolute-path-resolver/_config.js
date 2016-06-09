var path = require('path');

module.exports = {
	solo: true,
	description: 'normalizes absolute ids',
	options: {
		plugins: [{
			transform: function (code, id) {
				if (/main/.test(id)) {
					return code.replace('"./a.js"', JSON.stringify(path.resolve(__dirname, 'a.js')));
				}
			}
		}]
	}
};
