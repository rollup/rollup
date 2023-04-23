const assert = require('node:assert');
const path = require('node:path');

const ID_OTHER_1 = path.join(__dirname, 'other1.js');
const ID_OTHER_2 = path.join(__dirname, 'other2.js');
const ID_OTHER_3 = path.join(__dirname, 'other3.js');
const ID_OTHER_4 = path.join(__dirname, 'other4.js');

const thirdPluginCalls = new Set();

module.exports = defineTest({
	description: 'prevents infinite loops when several plugins are calling this.resolve in resolveId',
	options: {
		plugins: [
			{
				name: 'first',
				async resolveId(source, importer) {
					const { id } = await this.resolve(source, importer, { skipSelf: true });
					if (id === ID_OTHER_1) {
						return ID_OTHER_4;
					}
				}
			},
			{
				name: 'second',
				async resolveId(source, importer) {
					const { id } = await this.resolve(source, importer, { skipSelf: true });
					if (id === ID_OTHER_2) {
						// To make this more interesting
						// The first plugin should resolve everything to 4
						assert.strictEqual(
							(await this.resolve('./other1', importer, { skipSelf: true })).id,
							ID_OTHER_4
						);
						// The second file should however be resolved by core as this plugin is out of the loop
						assert.strictEqual(
							(await this.resolve(source, ID_OTHER_1, { skipSelf: true })).id,
							ID_OTHER_2
						);
						return ID_OTHER_4;
					}
				}
			},
			{
				name: 'third',
				async resolveId(source, importer) {
					// Implement our own loop prevention
					const hash = `${source}:${importer}`;
					if (thirdPluginCalls.has(hash)) {
						return null;
					}
					thirdPluginCalls.add(hash);
					const { id } = await this.resolve(source, importer);
					thirdPluginCalls.delete(hash);
					if (id === ID_OTHER_3) {
						return ID_OTHER_4;
					}
				}
			}
		]
	}
});
