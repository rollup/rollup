const assert = require('node:assert');
const path = require('node:path');

module.exports = defineTest({
	description: 'uses a custom path resolver (asynchronous)',
	options: {
		plugins: [
			{
				resolveId(importee) {
					if (path.normalize(importee) === path.join(__dirname, 'main.js')) return importee;

					return Promise.resolve(importee === 'foo' ? path.join(__dirname, 'bar.js') : false);
				}
			}
		]
	},
	exports(exports) {
		assert.strictEqual(exports.path, require('node:path'));
	}
});
