const assert = require('node:assert');
const path = require('node:path');

const ID_MAIN = path.join(__dirname, 'main.js');
const ID_MODULE = path.join(__dirname, 'module.js');
const ID_MODULE_2 = path.join(__dirname, 'module2.js');

const expectedResult = {
	[ID_MAIN]: {
		exports: ['moduleAlias', '*'],
		exportedBindings: { '.': [], './module.js': ['moduleAlias', '*'] }
	},
	[ID_MODULE]: {
		exports: ['default', 'module', '*'],
		exportedBindings: { '.': ['default', 'module'], './module2.js': ['*'] }
	},
	[ID_MODULE_2]: {
		exports: ['module2'],
		exportedBindings: { '.': ['module2'] }
	}
};

module.exports = defineTest({
	description: 'check exports and exportedBindings in moduleParsed as a supplementary test',
	options: {
		plugins: {
			name: 'test-plugin',
			moduleParsed(moduleInfo) {
				const { exports, exportedBindings, id } = moduleInfo;
				assert.deepStrictEqual({ exports, exportedBindings }, expectedResult[id]);
			}
		}
	}
});
