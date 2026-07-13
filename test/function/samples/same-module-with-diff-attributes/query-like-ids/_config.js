const assert = require('node:assert/strict');

const encodedAttributes = '%7B%22language%22%3A%22en%22%2C%22type%22%3A%22json%22%7D';
const expectedRawIdsByImporter = new Map([
	[`importer?attributes=${encodedAttributes}`, 'importer'],
	[`importer?plugin&attributes=${encodedAttributes}`, 'importer?plugin']
]);

module.exports = defineTest({
	description: 'preserves query-like ids when adding and extracting attributes',
	options: {
		plugins: [
			{
				async buildStart() {
					for (const importer of expectedRawIdsByImporter.keys()) {
						await this.resolve('target', importer, { skipSelf: false });
					}
				},
				resolveId(id, importer, { attributes, importerAttributes, importerRawId }) {
					if (id === 'main') return id;
					if (id === 'target') {
						assert.deepEqual(importerAttributes, { language: 'en', type: 'json' });
						assert.deepEqual(attributes, {});
						assert.equal(importerRawId, expectedRawIdsByImporter.get(importer));
						return { external: true, id };
					}
					return {
						attributes: { type: 'json', language: 'en' },
						id: 'module?plugin'
					};
				},
				load(id, { attributes, rawId }) {
					if (id === 'main') return "import 'module';";
					assert.equal(id, `module?plugin&attributes=${encodedAttributes}`);
					assert.equal(rawId, 'module?plugin');
					assert.deepEqual(attributes, { language: 'en', type: 'json' });
					return 'assert.ok(true);';
				}
			}
		]
	}
});
