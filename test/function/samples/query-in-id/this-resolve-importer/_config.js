const assert = require('node:assert/strict');

// An importer id that contains a "?" for reasons unrelated to import
// attributes, e.g. a Vite-style query suffix on a virtual module.
const IMPORTER_ID = '\0virtual:asset?width=100&height=200';

module.exports = defineTest({
	description:
		'does not misinterpret a "?" query in the importer id as import attributes when calling this.resolve',
	options: {
		plugins: [
			{
				name: 'resolver',
				async buildStart() {
					await this.resolve('./dep', IMPORTER_ID);
				}
			},
			{
				name: 'asserter',
				resolveId(source, importer, { importerRawId, importerAttributes }) {
					if (source === './dep') {
						// The importer's "?" is part of the id, so the resolver hook must see
						// the full importer as importerRawId and receive no attributes.
						assert.equal(
							importer,
							IMPORTER_ID,
							`importer should be "${IMPORTER_ID}" but got "${importer}"`
						);
						assert.equal(
							importerRawId,
							IMPORTER_ID,
							`importerRawId should be "${IMPORTER_ID}" but got "${importerRawId}"`
						);
						assert.deepEqual(
							importerAttributes,
							{},
							`importerAttributes should be empty but got ${JSON.stringify(importerAttributes)}`
						);
						return false;
					}
				}
			}
		]
	}
});
