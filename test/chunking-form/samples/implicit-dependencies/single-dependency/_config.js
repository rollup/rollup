const path = require('path');
const assert = require('assert');

const ID_MAIN = path.join(__dirname, 'main.js');
const ID_LIB = path.join(__dirname, 'lib.js');
const ID_DEP = path.join(__dirname, 'dep.js');

module.exports = {
	description: 'supports implicit dependencies when emitting files',
	options: {
		preserveEntrySignatures: 'allow-extension',
		plugins: {
			name: 'test-plugin',
			buildStart() {
				this.emitFile({
					type: 'chunk',
					id: 'dep.js',
					implicitlyLoadedAfterOneOf: [ID_MAIN]
				});
			},
			buildEnd() {
				assert.deepStrictEqual(this.getModuleInfo(ID_MAIN), {
					dynamicallyImportedIds: [],
					dynamicImporters: [],
					hasModuleSideEffects: true,
					id: ID_MAIN,
					implicitlyLoadedAfterOneOf: [],
					implicitlyLoadedBefore: [ID_DEP],
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
					implicitlyLoadedAfterOneOf: [ID_MAIN],
					implicitlyLoadedBefore: [],
					importedIds: [ID_LIB],
					importers: [],
					isEntry: false,
					isExternal: false
				});
			},
			generateBundle(options, bundle) {
				const main = bundle['main.js'];
				assert.deepStrictEqual(
					main.implicitlyLoadedBefore,
					['generated-dep.js'],
					'main.implicitlyLoadedBefore'
				);
				assert.strictEqual(main.isEntry, true, 'main.isEntry');
				assert.strictEqual(main.isDynamicEntry, false, 'main.isDynamicEntry');
				assert.strictEqual(main.isImplicitEntry, false, 'main.isImplicitEntry');
				const dep = bundle['generated-dep.js'];
				assert.deepStrictEqual(dep.implicitlyLoadedBefore, [], 'dep.implicitlyLoadedBefore');
				assert.strictEqual(dep.isEntry, false, 'dep.isEntry');
				assert.strictEqual(dep.isDynamicEntry, false, 'dep.isDynamicEntry');
				assert.strictEqual(dep.isImplicitEntry, true, 'dep.isImplicitEntry');
			}
		}
	}
};
