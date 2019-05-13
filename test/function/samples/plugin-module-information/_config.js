const assert = require('assert');
const path = require('path');

const ID_MAIN = path.join(__dirname, 'main.js');
const ID_FOO = path.join(__dirname, 'foo.js');
const ID_NESTED = path.join(__dirname, 'nested', 'nested.js');
const ID_PATH = 'path';

let rendered = false;

module.exports = {
	description: 'provides module information on the plugin context',
	options: {
		external: ['path'],
		plugins: [
			{
				renderStart() {
					rendered = true;
					assert.deepEqual(Array.from(this.moduleIds), [ID_MAIN, ID_FOO, ID_NESTED, ID_PATH]);
					assert.deepEqual(this.getModuleInfo(ID_MAIN), {
						hasModuleSideEffects: true,
						id: ID_MAIN,
						importedIds: [ID_FOO, ID_NESTED],
						isEntry: true,
						isExternal: false
					});
					assert.deepEqual(this.getModuleInfo(ID_FOO), {
						hasModuleSideEffects: true,
						id: ID_FOO,
						importedIds: [ID_PATH],
						isEntry: false,
						isExternal: false
					});
					assert.deepEqual(this.getModuleInfo(ID_NESTED), {
						hasModuleSideEffects: true,
						id: ID_NESTED,
						importedIds: [ID_FOO],
						isEntry: false,
						isExternal: false
					});
					assert.deepEqual(this.getModuleInfo(ID_PATH), {
						hasModuleSideEffects: true,
						id: ID_PATH,
						importedIds: [],
						isEntry: false,
						isExternal: true
					});
				}
			}
		]
	},
	bundle() {
		assert.ok(rendered);
	}
};
