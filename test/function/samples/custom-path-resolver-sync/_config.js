const assert = require('node:assert');
const path = require('node:path');

module.exports = defineTest({
	description: 'uses a custom path resolver (synchronous)',
	options: {
		plugins: [
			{
				resolveId(importee) {
					if (path.normalize(importee) === path.join(__dirname, 'main.js')) return importee;
					if (importee === 'foo') return path.join(__dirname, 'bar.js');

					return false;
				}
			}
		]
	},
	exports(exports) {
		assert.strictEqual(exports.path, require('node:path'));
	}
});
