const assert = require('node:assert/strict');
const path = require('node:path');

const ID_FIRST = path.join(__dirname, 'first.js');
const ID_DATA_WITH_ATTRIBUTES = `${path.join(__dirname, 'data.js')}?attributes=${encodeURIComponent('{"type":"custom"}')}`;

module.exports = defineTest({
	description: 'reuses a resolved import in resolveId when replacing its id with the raw id',
	options: {
		plugins: [
			{
				name: 'test',
				async resolveId(source) {
					if (source === 'reused-data') {
						const {
							importedIdResolutions: [resolution]
						} = await this.load({ id: ID_FIRST, resolveDependencies: true });
						return { ...resolution, id: resolution.rawId };
					}
				},
				buildEnd() {
					assert.deepEqual(
						[...this.getModuleIds()].filter(id => id.includes('data.js')),
						[ID_DATA_WITH_ATTRIBUTES]
					);
				}
			}
		]
	}
});
