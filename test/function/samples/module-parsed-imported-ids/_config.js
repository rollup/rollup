const assert = require('assert');
const path = require('path');

module.exports = {
	description: 'supports importedIds in the moduleParsed hook',
	options: {
		plugins: [
			{
				name: 'test-plugin',
				moduleParsed({ dynamicallyImportedIds, id, importedIds }) {
					if (id.endsWith('main.js')) {
						assert.deepStrictEqual(importedIds, [path.join(__dirname, 'static.js')]);
						assert.deepStrictEqual(dynamicallyImportedIds, [path.join(__dirname, 'dynamic.js')]);
					}
				}
			}
		]
	}
};
