const assert = require('assert');
const path = require('path');

let rendered = false;

module.exports = {
	description: 'provides all module ids on the plugin context',
	options: {
		strictDeprecations: false,
		external: ['path'],
		plugins: {
			renderStart() {
				rendered = true;
				assert.deepStrictEqual(Array.from(this.moduleIds), [
					path.join(__dirname, 'main.js'),
					path.join(__dirname, 'foo.js'),
					'path'
				]);
			}
		}
	},
	bundle() {
		assert.ok(rendered);
	}
};
