const path = require('path');

const ID_OTHER_1 = path.join(__dirname, 'other1.js');
const ID_OTHER_2 = path.join(__dirname, 'other2.js');
const ID_OTHER_3 = path.join(__dirname, 'other3.js');

module.exports = {
	description: 'prevents infinite loops when several plugins are calling this.resolve in resolveId',
	options: {
		plugins: [
			{
				name: 'first',
				async resolveId(source, importer) {
					const { id } = await this.resolve(source, importer, { skipSelf: true });
					if (id === ID_OTHER_2) {
						return ID_OTHER_3;
					}
				}
			},
			{
				name: 'second',
				async resolveId(source, importer) {
					const { id } = await this.resolve(source, importer, { skipSelf: true });
					if (id === ID_OTHER_1) {
						return ID_OTHER_2;
					}
				}
			}
		]
	}
};
