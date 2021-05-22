const assert = require('assert');
const path = require('path');

module.exports = {
	description: 'uses a custom path resolver (asynchronous)',
	options: {
		plugins: [
			{
				resolveId(importee) {
					let resolved;

					if (path.normalize(importee) === path.join(__dirname, 'main.js')) return importee;

					if (importee === 'foo') {
						resolved = path.join(__dirname, 'bar.js');
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
