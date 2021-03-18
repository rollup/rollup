const path = require('path');

const ID_OTHER_1 = path.join(__dirname, 'other1.js');
const ID_OTHER_2 = path.join(__dirname, 'other2.js');
const ID_OTHER_3 = path.join(__dirname, 'other3.js');
const ID_OTHER_4 = path.join(__dirname, 'other4.js');

const thirdPluginCalls = new Set();

module.exports = {
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
						await this.resolve('./other1', importer, { skipSelf: true });
						await this.resolve(source, ID_OTHER_1, { skipSelf: true });
						return ID_OTHER_4;
					}
				}
			},
			{
				name: 'third',
				async resolveId(source, importer) {
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
};
