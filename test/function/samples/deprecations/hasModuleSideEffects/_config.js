const assert = require('node:assert');
const path = require('node:path');

module.exports = defineTest({
	description: 'warns that accessing "ModuleInfo.hasModuleSideEffects" is deprecated',
	options: {
		strictDeprecations: true,
		plugins: [
			{
				name: 'test',
				moduleParsed({ hasModuleSideEffects }) {
					assert.ok(hasModuleSideEffects);
				}
			}
		]
	},
	error: {
		code: 'PLUGIN_ERROR',
		hook: 'moduleParsed',
		message:
			'Accessing ModuleInfo.hasModuleSideEffects from plugins is deprecated. Please use ModuleInfo.moduleSideEffects instead.',
		plugin: 'test',
		pluginCode: 'DEPRECATED_FEATURE',
		url: 'https://rollupjs.org/plugin-development/#this-getmoduleinfo',
		watchFiles: [path.join(__dirname, 'main.js')]
	}
});
