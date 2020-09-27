const path = require('path');
const assert = require('assert');

const ID_MAIN = path.join(__dirname, 'main.js');
const ID_LIB = path.join(__dirname, 'lib.js');
const ID_DEP = path.join(__dirname, 'dep.js');

module.exports = {
	description: 'makes sure emitted entry points are never implicit dependencies',
	options: {
		preserveEntrySignatures: 'allow-extension',
		plugins: {
			name: 'test-plugin',
			async buildStart() {
				this.emitFile({
					type: 'chunk',
					id: 'dep.js',
					implicitlyLoadedAfterOneOf: [ID_MAIN]
				});
				await new Promise(resolve => setTimeout(resolve, 200));
				this.emitFile({
					type: 'chunk',
					id: 'dep.js'
				});
			},
			buildEnd() {
				assert.deepStrictEqual(this.getModuleInfo(ID_MAIN), {
					dynamicallyImportedIds: [],
					dynamicImporters: [],
					hasModuleSideEffects: true,
					id: ID_MAIN,
					implicitlyLoadedAfterOneOf: [],
					implicitlyLoadedBefore: [],
					importedIds: [ID_LIB],
					importers: [],
					isEntry: true,
					isExternal: false,
					meta: {}
				});
				assert.deepStrictEqual(this.getModuleInfo(ID_DEP), {
					dynamicallyImportedIds: [],
					dynamicImporters: [],
					hasModuleSideEffects: true,
					id: ID_DEP,
					implicitlyLoadedAfterOneOf: [],
					implicitlyLoadedBefore: [],
					importedIds: [ID_LIB],
					importers: [],
					isEntry: true,
					isExternal: false,
					meta: {}
				});
			},
			generateBundle(options, bundle) {
				const main = bundle['main.js'];
				assert.deepStrictEqual(main.implicitlyLoadedBefore, [], 'main.implicitlyLoadedBefore');
				assert.strictEqual(main.isEntry, true, 'main.isEntry');
				assert.strictEqual(main.isDynamicEntry, false, 'main.isDynamicEntry');
				assert.strictEqual(main.isImplicitEntry, false, 'main.isImplicitEntry');
				const dep = bundle['generated-dep.js'];
				assert.deepStrictEqual(dep.implicitlyLoadedBefore, [], 'dep.implicitlyLoadedBefore');
				assert.strictEqual(dep.isEntry, true, 'dep.isEntry');
				assert.strictEqual(dep.isDynamicEntry, false, 'dep.isDynamicEntry');
				assert.strictEqual(dep.isImplicitEntry, false, 'dep.isImplicitEntry');
			}
		}
	}
};
