const assert = require('node:assert');
const path = require('node:path');

module.exports = defineTest({
	description: 'uses a custom external path resolver (synchronous)',
	options: {
		plugins: [
			{
				resolveId(id, importer) {
					if (importer && id[0] !== '.') return path.join(__dirname, 'js_modules', id + '.js');
				}
			}
		]
	},
	exports(exports) {
		assert.ok(exports.success);
	}
});
