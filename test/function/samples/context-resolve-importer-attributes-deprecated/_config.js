const assert = require('node:assert');

module.exports = defineTest({
	description: 'supports the deprecated importerAttributes option of this.resolve',
	options: {
		strictDeprecations: false,
		plugins: [
			{
				name: 'caller',
				async buildStart() {
					await this.resolve('legacy-target', 'importer', {
						importerAttributes: { type: 'legacy' }
					});
				}
			},
			{
				name: 'resolver',
				resolveId(source, importer, { importerAttributes, importerRawId }) {
					if (source === 'legacy-target') {
						assert.equal(importer, 'importer?type=legacy');
						assert.equal(importerRawId, 'importer');
						assert.deepEqual(importerAttributes, { type: 'legacy' });
						return { external: true, id: source };
					}
				}
			}
		]
	},
	warnings: [
		{
			code: 'DEPRECATED_FEATURE',
			message:
				'[plugin caller] The "importerAttributes" option is deprecated. Provide a UniqueModuleId for "importer" instead.',
			plugin: 'caller',
			url: 'https://rollupjs.org/plugin-development/#this-resolve'
		}
	]
});
