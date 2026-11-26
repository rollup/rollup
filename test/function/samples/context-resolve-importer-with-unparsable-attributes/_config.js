const assert = require('node:assert');

const opaqueImporters = [
	'virtual?attributes=foo',
	'virtual?attributes=%zz',
	`foo&attributes=${encodeURIComponent(JSON.stringify({ type: 'json' }))}`,
	'virtual?attributes=%7B%7D'
];
const appendedAttributesImporter = `virtual?attributes=foo&attributes=${encodeURIComponent(
	JSON.stringify({ type: 'json' })
)}`;

module.exports = defineTest({
	description:
		'treats importer ids with an attributes parameter that Rollup did not encode as opaque ids',
	options: {
		plugins: [
			{
				name: 'caller',
				async buildStart() {
					for (const importer of [...opaqueImporters, appendedAttributesImporter]) {
						const resolution = await this.resolve('target', importer);
						assert.equal(resolution.id, 'target');
						assert.equal(resolution.external, true);
					}
				}
			},
			{
				name: 'resolver',
				resolveId(source, importer, { importerAttributes, importerRawId }) {
					if (source !== 'target') return;
					if (opaqueImporters.includes(importer)) {
						assert.equal(importerRawId, importer);
						assert.deepEqual(importerAttributes, {});
					} else {
						assert.equal(importer, appendedAttributesImporter);
						assert.equal(importerRawId, 'virtual?attributes=foo');
						assert.deepEqual(importerAttributes, { type: 'json' });
					}
					return { external: true, id: source };
				}
			}
		]
	}
});
