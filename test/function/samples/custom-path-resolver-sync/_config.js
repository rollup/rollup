const assert = require('assert');
const path = require('path');

module.exports = {
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
		assert.strictEqual(exports.path, require('path'));
	}
};
