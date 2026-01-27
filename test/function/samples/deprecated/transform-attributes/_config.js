const path = require('node:path');

const ID_MAIN = path.join(__dirname, 'main.js');

module.exports = defineTest({
	description: 'does not allow returning attributes from the "transform" hook',
	options: {
		strictDeprecations: true,
		plugins: [
			{
				resolveId(source) {
					if (source.endsWith('.json')) {
						return {
							id: source
						};
					}
				},
				load(id) {
					if (id.endsWith('.json')) {
						return {
							code: 'export default {a:1}'
						};
					}
				},
				transform(code, id) {
					if (id.endsWith('.json')) {
						return { code, attributes: {} };
					}
				}
			}
		]
	},
	error: {
		code: 'PLUGIN_ERROR',
		hook: 'transform',
		id: './foo.json',
		message: 'Returning attributes from the "transform" hook is forbidden.',
		plugin: 'at position 1',
		pluginCode: 'DEPRECATED_FEATURE',
		url: 'https://rollupjs.org/plugin-development/#transform',
		watchFiles: [ID_MAIN]
	}
});
