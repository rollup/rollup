const assert = require('node:assert/strict');
const path = require('node:path');

const ID_DATA = path.join(__dirname, 'data.js');
const getIdWithAttributes = type =>
	`${ID_DATA}?attributes=${encodeURIComponent(JSON.stringify({ type }))}`;

module.exports = defineTest({
	description: 'assigns modules with attributes to manual chunks via objects or composite ids',
	options: {
		output: {
			manualChunks: {
				composite: [getIdWithAttributes('composite')],
				object: [{ attributes: { type: 'object' }, rawId: './data.js' }]
			}
		},
		plugins: [
			{
				name: 'test',
				generateBundle(_options, bundle) {
					const moduleIdsByChunkName = Object.fromEntries(
						Object.values(bundle).map(chunk => [chunk.name, chunk.moduleIds])
					);
					assert.deepEqual(moduleIdsByChunkName.composite, [getIdWithAttributes('composite')]);
					assert.deepEqual(moduleIdsByChunkName.object, [getIdWithAttributes('object')]);
					assert.ok(moduleIdsByChunkName.main.includes(ID_DATA));
				}
			}
		]
	}
});
