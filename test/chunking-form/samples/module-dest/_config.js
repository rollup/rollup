const path = require('path');

module.exports = {
	description: 'change the module destination',
	options: {
		input: ['lib/main.js'],
		experimentalPreserveModules: true,
		inputRelativeDir: path.join(__dirname, 'lib'),
		paths(id) {
			if (id === '../deps/dep.js') {
				return 'dep';
			}
		},
		plugins: [
			{
				resolveId(importee) {
					if (importee === 'dep') {
						return path.join(__dirname, 'deps/dep.js');
					}
				},
				moduleDest(file) {
					if (file === '../deps/dep.js') {
						return 'dep.js';
					}
				}
			}
		]
	}
};
