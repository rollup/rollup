const assert = require('node:assert/strict');
const path = require('node:path');

const ID_DATA = path.join(__dirname, 'data.js');
const ID_DATA_WITH_ATTRIBUTES = `${ID_DATA}?attributes=${encodeURIComponent('{"type":"custom"}')}`;

module.exports = defineTest({
	description: 'loads the module identified by the attributes passed to this.load',
	options: {
		plugins: [
			{
				name: 'test',
				async resolveId(source, importer, { attributes }) {
					if (source === './data.js') {
						const resolution = await this.resolve(source, importer, { attributes });
						const moduleInfo = await this.load(resolution);
						assert.equal(moduleInfo.id, ID_DATA_WITH_ATTRIBUTES);
						assert.equal(
							await this.load({ attributes: { type: 'custom' }, id: ID_DATA_WITH_ATTRIBUTES }),
							moduleInfo
						);
						assert.equal(
							await this.load({ attributes: null, id: ID_DATA_WITH_ATTRIBUTES }),
							moduleInfo
						);
						return resolution;
					}
				}
			}
		]
	}
});
