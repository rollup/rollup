const assert = require('assert');
const path = require('path');

module.exports = {
	description: 'Dynamic import inlining when resolution id is a module in the bundle',
	options: {
		plugins: [
			{
				resolveDynamicImport(specifier, parent) {
					if (specifier === './main') return path.resolve(__dirname, 'main.js');
				}
			}
		]
	},
	exports(exports) {
		assert.equal(exports.y, 42);
		return Promise.resolve(exports.promise).then(val => {
			assert.equal(val, 84);
		});
	}
};
