const path = require('path');
const assert = require('assert');

const ID_MAIN1 = path.join(__dirname, 'main1.js');
const ID_MAIN2 = path.join(__dirname, 'main2.js');
const ID_LIB1 = path.join(__dirname, 'lib1.js');
const ID_LIB1B = path.join(__dirname, 'lib1b.js');
const ID_LIB2 = path.join(__dirname, 'lib2.js');
const ID_LIB3 = path.join(__dirname, 'lib3.js');
const ID_DEP = path.join(__dirname, 'dep.js');

module.exports = {
	description: 'supports emitting the same chunk with different and multiple dependencies',
	options: {
		input: ['main1', 'main2'],
		plugins: {
			name: 'test-plugin',
			buildStart() {
				this.emitFile({
					type: 'chunk',
					id: 'dep.js',
					implicitlyLoadedAfterOneOf: [ID_MAIN1]
				});
				this.emitFile({
					type: 'chunk',
					id: 'dep.js',
					implicitlyLoadedAfterOneOf: [ID_MAIN1, ID_MAIN2]
				});
				this.emitFile({
					type: 'chunk',
					id: 'dep.js',
					implicitlyLoadedAfterOneOf: [ID_MAIN2]
				});
			},
			buildEnd() {
				assert.deepStrictEqual(this.getModuleInfo(ID_MAIN1), {
					dynamicallyImportedIds: [],
					dynamicImporters: [],
					hasModuleSideEffects: true,
					id: ID_MAIN1,
					implicitlyLoadedAfterOneOf: [],
					implicitlyLoadedBefore: [ID_DEP],
					importedIds: [ID_LIB1, ID_LIB1B, ID_LIB2],
					importers: [],
					isEntry: true,
					isExternal: false
				});
				assert.deepStrictEqual(this.getModuleInfo(ID_MAIN2), {
					dynamicallyImportedIds: [],
					dynamicImporters: [],
					hasModuleSideEffects: true,
					id: ID_MAIN2,
					implicitlyLoadedAfterOneOf: [],
					implicitlyLoadedBefore: [ID_DEP],
					importedIds: [ID_LIB1, ID_LIB1B, ID_LIB3],
					importers: [],
					isEntry: true,
					isExternal: false
				});
				assert.deepStrictEqual(this.getModuleInfo(ID_DEP), {
					dynamicallyImportedIds: [],
					dynamicImporters: [],
					hasModuleSideEffects: true,
					id: ID_DEP,
					implicitlyLoadedAfterOneOf: [ID_MAIN1, ID_MAIN2],
					implicitlyLoadedBefore: [],
					importedIds: [ID_LIB1, ID_LIB2, ID_LIB3],
					importers: [],
					isEntry: false,
					isExternal: false
				});
			}
		}
	}
};
