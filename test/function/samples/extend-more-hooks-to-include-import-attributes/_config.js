const assert = require('node:assert');

module.exports = defineTest({
	description: 'extend load, transform and renderDynamicImport to include import attributes',
	options: {
		plugins: [
			{
				resolveId(source, _importer, options) {
					if (source.endsWith('.json')) {
						assert.deepEqual(options.attributes, { type: 'json' });
						return {
							id: source
						};
					}
					if (source.endsWith('lib.js')) {
						return {
							id: source,
							external: true
						};
					}
				},
				load(id, options) {
					if (id.endsWith('.json')) {
						assert.deepEqual(options.attributes, { type: 'json' });
						return 'export default {a:1}';
					}
				},
				transform(code, id, options) {
					if (id.endsWith('.json')) {
						assert.deepEqual(options.attributes, { type: 'json' });
						return code;
					}
				},
				renderDynamicImport(options) {
					assert.deepEqual(options.targetModuleAttributes, { type: 'javascript' });
				}
			}
		]
	}
});
