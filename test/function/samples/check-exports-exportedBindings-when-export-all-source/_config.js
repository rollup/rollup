const assert = require('node:assert');
const path = require('node:path');

const ID_MAIN = path.join(__dirname, 'main.js');
const ID_MODULE = path.join(__dirname, 'module.js');

const expectedResult = {
	[ID_MAIN]: {
		exports: ['moduleAlias', '*'],
		exportedBindings: { '.': [], './module.js': ['moduleAlias', '*'] }
	},
	[ID_MODULE]: {
		exports: ['default', 'module'],
		exportedBindings: { '.': ['default', 'module'] }
	}
};

module.exports = {
	description: 'check exports and exportedBindings in moduleParsed when exporting all source',
	options: {
		plugins: {
			moduleParsed(moduleInfo) {
				const { exports, exportedBindings, id } = moduleInfo;
				assert.deepStrictEqual({ exports, exportedBindings }, expectedResult[id]);
			}
		}
	}
};
