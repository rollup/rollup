const assert = require('assert');
const path = require('path');

module.exports = {
	description: 'provides full importedIds and dynamicallyImportedIds in the moduleParsed hook',
	options: {
		plugins: [
			{
				load(id) {
					const { dynamicallyImportedIds, importedIds } = this.getModuleInfo(id);
					assert.deepStrictEqual(importedIds, []);
					assert.deepStrictEqual(dynamicallyImportedIds, []);
				},
				transform(code, id) {
					const { dynamicallyImportedIds, importedIds } = this.getModuleInfo(id);
					assert.deepStrictEqual(importedIds, []);
					assert.deepStrictEqual(dynamicallyImportedIds, []);
				},
				moduleParsed({ dynamicallyImportedIds, id, importedIds }) {
					if (id.endsWith('main.js')) {
						assert.deepStrictEqual(importedIds, [path.join(__dirname, 'static.js')]);
						assert.deepStrictEqual(dynamicallyImportedIds, [path.join(__dirname, 'dynamic.js')]);
					} else {
						assert.deepStrictEqual(importedIds, []);
						assert.deepStrictEqual(dynamicallyImportedIds, []);
					}
				}
			}
		]
	}
};
