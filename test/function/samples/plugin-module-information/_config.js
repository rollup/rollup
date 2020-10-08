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
		plugins: {
			load(id) {
				assert.deepStrictEqual(this.getModuleInfo(id), {
					dynamicImporters: [],
					dynamicallyImportedIds: [],
					hasModuleSideEffects: true,
					id,
					implicitlyLoadedAfterOneOf: [],
					implicitlyLoadedBefore: [],
					importedIds: [],
					importers: [],
					isEntry: id === ID_MAIN,
					isExternal: false,
					meta: {}
				});
			},
			renderStart() {
				rendered = true;
				assert.deepStrictEqual(Array.from(this.getModuleIds()), [
					ID_MAIN,
					ID_FOO,
					ID_PATH,
					ID_NESTED
				]);
				assert.deepStrictEqual(this.getModuleInfo(ID_MAIN), {
					dynamicImporters: [],
					dynamicallyImportedIds: [ID_NESTED, ID_PATH],
					hasModuleSideEffects: true,
					id: ID_MAIN,
					implicitlyLoadedAfterOneOf: [],
					implicitlyLoadedBefore: [],
					importedIds: [ID_FOO],
					importers: [],
					isEntry: true,
					isExternal: false,
					meta: {}
				});
				assert.deepStrictEqual(this.getModuleInfo(ID_FOO), {
					dynamicImporters: [],
					dynamicallyImportedIds: [],
					hasModuleSideEffects: true,
					id: ID_FOO,
					implicitlyLoadedAfterOneOf: [],
					implicitlyLoadedBefore: [],
					importedIds: [ID_PATH],
					importers: [ID_MAIN, ID_NESTED],
					isEntry: false,
					isExternal: false,
					meta: {}
				});
				assert.deepStrictEqual(this.getModuleInfo(ID_NESTED), {
					dynamicImporters: [ID_MAIN],
					dynamicallyImportedIds: [],
					hasModuleSideEffects: true,
					id: ID_NESTED,
					implicitlyLoadedAfterOneOf: [],
					implicitlyLoadedBefore: [],
					importedIds: [ID_FOO],
					importers: [],
					isEntry: false,
					isExternal: false,
					meta: {}
				});
				assert.deepStrictEqual(this.getModuleInfo(ID_PATH), {
					dynamicImporters: [ID_MAIN],
					dynamicallyImportedIds: [],
					hasModuleSideEffects: true,
					id: ID_PATH,
					implicitlyLoadedAfterOneOf: [],
					implicitlyLoadedBefore: [],
					importedIds: [],
					importers: [ID_FOO],
					isEntry: false,
					isExternal: true,
					meta: {}
				});
			}
		}
	},
	context: {
		thePath: 'path'
	},
	bundle() {
		assert.ok(rendered);
	}
};
