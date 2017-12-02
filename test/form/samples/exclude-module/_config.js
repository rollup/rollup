const path = require('path');

module.exports = {
	description: 'exclude module when preserving modules',
	options: {
		excludedModules: [
			path.join(__dirname, 'main.js')
		]
	}
};
