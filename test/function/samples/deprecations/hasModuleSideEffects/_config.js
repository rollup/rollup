const assert = require('assert');
const path = require('path');

module.exports = {
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
		watchFiles: [path.join(__dirname, 'main.js')]
	}
};
