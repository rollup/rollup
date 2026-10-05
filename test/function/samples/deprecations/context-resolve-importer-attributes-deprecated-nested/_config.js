const assert = require('node:assert');

module.exports = defineTest({
	description:
		'warns when the deprecated importerAttributes option of this.resolve is used within the resolveId hook',
	options: {
		strictDeprecations: false,
		plugins: [
			{
				name: 'caller',
				async buildStart() {
					await this.resolve('trigger');
				}
			},
			{
				name: 'nested-caller',
				async resolveId(source) {
					if (source === 'trigger') {
						await this.resolve('legacy-target', 'importer', {
							importerAttributes: { type: 'legacy' }
						});
						return { external: true, id: source };
					}
				}
			},
			{
				name: 'resolver',
				resolveId(source, importer, { importerAttributes, importerRawId }) {
					if (source === 'legacy-target') {
						assert.equal(importer, 'importer?attributes=%7B%22type%22%3A%22legacy%22%7D');
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
				'[plugin nested-caller] The "importerAttributes" option is deprecated. Provide a UniqueModuleId for "importer" instead.',
			plugin: 'nested-caller',
			url: 'https://rollupjs.org/plugin-development/#this-resolve'
		}
	]
});
