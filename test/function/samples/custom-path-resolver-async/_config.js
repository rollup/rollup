const path = require('path');
const assert = require('assert');

module.exports = {
	description: 'uses a custom path resolver (asynchronous)',
	options: {
		plugins: [
			{
				resolveId(importee, importer) {
					let resolved;

					if (path.normalize(importee) === path.resolve(__dirname, 'main.js')) return importee;

					if (importee === 'foo') {
						resolved = path.resolve(__dirname, 'bar.js');
					} else {
						resolved = false;
					}

					return Promise.resolve(resolved);
				}
			}
		]
	},
	exports(exports) {
		assert.strictEqual(exports.path, require('path'));
	}
};
