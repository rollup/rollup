const path = require('node:path');
const acorn = require('acorn');

const code = 'export default 42;\n';
const ID_MAIN = path.join(__dirname, 'main.js');

module.exports = defineTest({
	description: 'errors in shouldTransformCachedModule abort the build',
	options: {
		cache: {
			modules: [
				{
					id: ID_MAIN,
					ast: acorn.parse(code, {
						ecmaVersion: 6,
						sourceType: 'module'
					}),
					code,
					dependencies: [],
					dynamicDependencies: [],
					originalCode: code,
					resolvedIds: {},
					sourcemapChain: [],
					transformDependencies: []
				}
			]
		},
		plugins: [
			{
				name: 'test',
				shouldTransformCachedModule() {
					throw new Error('broken');
				}
			}
		]
	},
	error: {
		code: 'PLUGIN_ERROR',
		hook: 'shouldTransformCachedModule',
		message: 'broken',
		plugin: 'test',
		watchFiles: [ID_MAIN]
	}
});
