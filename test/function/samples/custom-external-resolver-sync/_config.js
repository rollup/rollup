const path = require('path');
const assert = require('assert');

module.exports = {
	description: 'uses a custom external path resolver (synchronous)',
	options: {
		plugins: [
			{
				resolveId(id, importer) {
					if (importer && id[0] !== '.') return path.resolve(__dirname, 'js_modules', id + '.js');
				}
			}
		]
	},
	exports(exports) {
		assert.ok(exports.success);
	}
};
