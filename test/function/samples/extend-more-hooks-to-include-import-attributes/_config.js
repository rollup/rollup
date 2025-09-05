const assert = require('node:assert');
const acorn = require('acorn');

const code = 'export default 42;\n';

module.exports = defineTest({
	description: 'extend load, transform and renderDynamicImport to include import attributes',
	options: {
		cache: {
			modules: [
				{
					id: './lib2.js',
					ast: acorn.parse(code, {
						ecmaVersion: 6,
						sourceType: 'module'
					}),
					attributes: { type: 'javascript' },
					code,
					dependencies: [],
					customTransformCache: false,
					originalCode: code,
					originalSourcemap: null,
					resolvedIds: {},
					sourcemapChain: [],
					transformDependencies: []
				}
			]
		},
		plugins: [
			{
				resolveId(source, _importer, options) {
					if (source.endsWith('.json')) {
						assert.deepEqual(options.attributes, { type: 'json' });
						return {
							id: source
						};
					}
					if (source.endsWith('lib2.js')) {
						return {
							id: source
						};
					}
					if (source.endsWith('lib4.js')) {
						assert.deepEqual(options.importerAttributes, { type: 'javascript' });
					}
				},
				resolveDynamicImport(specifier, _importer, options) {
					if (specifier.endsWith('lib4.js')) {
						assert.deepEqual(options.importerAttributes, { type: 'javascript' });
					}
				},
				load(id, options) {
					if (id.endsWith('.json')) {
						assert.deepEqual(options.attributes, { type: 'json' });
						return 'export default {a:1}';
					}
					if (id.endsWith('lib2.js')) {
						return code;
					}
				},
				transform(code, id, options) {
					if (id.endsWith('.json')) {
						assert.deepEqual(options.attributes, { type: 'json' });
						return code;
					}
				},
				shouldTransformCachedModule({ attributes }) {
					assert.deepEqual(attributes, { type: 'javascript' });
				},
				renderDynamicImport(options) {
					if (options.targetModuleId.endsWith('lib3.js')) {
						assert.deepEqual(options.targetModuleAttributes, { type: 'javascript' });
					}
				}
			}
		]
	}
});
