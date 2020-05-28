const path = require('path');
const assert = require('assert');

const ID_MAIN = path.join(__dirname, 'main.js');
const ID_LIB = path.join(__dirname, 'lib.js');
const ID_DEP = path.join(__dirname, 'dep.js');

// TODO Lukas what about multiple emits of the same module with different dependants? -> Extend array
module.exports = {
	solo: true,
	description: 'supports implicit dependencies when emitting files',
	options: {
		plugins: {
			name: 'test-plugin',
			buildStart() {
				this.emitFile({
					type: 'chunk',
					id: 'dep.js',
					implicitDependants: [ID_MAIN]
				});
			},
			buildEnd() {
				assert.deepStrictEqual(this.getModuleInfo(ID_MAIN), {
					dynamicallyImportedIds: [],
					dynamicImporters: [],
					hasModuleSideEffects: true,
					id: ID_MAIN,
					implicitDependants: [],
					implicitDependencies: [ID_DEP],
					importedIds: [ID_LIB],
					importers: [],
					isEntry: true,
					isExternal: false
				});
				assert.deepStrictEqual(this.getModuleInfo(ID_DEP), {
					dynamicallyImportedIds: [],
					dynamicImporters: [],
					hasModuleSideEffects: true,
					id: ID_DEP,
					implicitDependants: [ID_MAIN],
					implicitDependencies: [],
					importedIds: [ID_LIB],
					importers: [],
					isEntry: false,
					isExternal: false
				});
			},
			generateBundle(options, bundle) {
				// TODO Lukas check bundle interface
			}
		}
	}
};
