const assert = require('node:assert');

const compositeImporter = `importer?attributes=${encodeURIComponent(
	JSON.stringify({ type: 'json' })
)}`;

module.exports = defineTest({
	description:
		'does not warn or change the importer when the importerAttributes option is passed on from the resolveId hook options',
	options: {
		plugins: [
			{
				name: 'caller',
				async buildStart() {
					await this.resolve('target', compositeImporter, {
						importerAttributes: { type: 'json' }
					});
				}
			},
			{
				name: 'forwarder',
				async resolveId(source, importer, options) {
					if (source === 'target') {
						return this.resolve('nested-target', importer, options);
					}
				}
			},
			{
				name: 'observer',
				resolveId(source, importer, { importerAttributes, importerRawId }) {
					if (source === 'nested-target') {
						assert.equal(importer, compositeImporter);
						assert.equal(importerRawId, 'importer');
						assert.deepEqual(importerAttributes, { type: 'json' });
						return { external: true, id: source };
					}
				}
			}
		]
	}
});
