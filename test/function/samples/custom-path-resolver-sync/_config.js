const path = require('path');
const assert = require('assert');

module.exports = {
	description: 'uses a custom path resolver (synchronous)',
	options: {
		plugins: [
			{
				resolveId(importee, importer) {
					if (path.normalize(importee) === path.resolve(__dirname, 'main.js')) return importee;
					if (importee === 'foo') return path.resolve(__dirname, 'bar.js');

					return false;
				}
			}
		]
	},
	exports(exports) {
		assert.strictEqual(exports.path, require('path'));
	}
};
