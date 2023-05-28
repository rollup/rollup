const assert = require('node:assert');
const path = require('node:path');

let rendered = false;

module.exports = defineTest({
	description: 'provides all module ids on the plugin context',
	options: {
		strictDeprecations: false,
		external: ['path'],
		plugins: {
			renderStart() {
				rendered = true;
				assert.deepStrictEqual([...this.moduleIds].sort(), [
					path.join(__dirname, 'foo.js'),
					path.join(__dirname, 'main.js'),
					'path'
				]);
			}
		}
	},
	bundle() {
		assert.ok(rendered);
	},
	warnings: [
		{
			code: 'DEPRECATED_FEATURE',
			message:
				'Accessing "this.moduleIds" on the plugin context by plugin at position 1 is deprecated. The "this.getModuleIds" plugin context function should be used instead.',
			plugin: 'at position 1',
			url: 'https://rollupjs.org/plugin-development/#this-getmoduleids'
		}
	]
});
