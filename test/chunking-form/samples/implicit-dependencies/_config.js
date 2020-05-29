const path = require('path');
const assert = require('assert');

const ID_MAIN = path.join(__dirname, 'main.js');
const ID_LIB = path.join(__dirname, 'lib.js');
const ID_DEP = path.join(__dirname, 'dep.js');

// TODO Lukas what about multiple emits of the same module with different dependants?
// TODO Lukas what about multiple dependants in a single emit
// TODO Lukas what if the original module is not included (empty)/executed (behind a missing dynamic import)?
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
				const main = bundle['main.js'];
				assert.deepStrictEqual(
					main.implicitDependencies,
					['generated-dep.js'],
					'main.implicitDependencies'
				);
				assert.strictEqual(main.isEntry, true, 'main.isEntry');
				assert.strictEqual(main.isDynamicEntry, false, 'main.isDynamicEntry');
				assert.strictEqual(main.isImplicitEntry, false, 'main.isImplicitEntry');
				const dep = bundle['generated-dep.js'];
				assert.deepStrictEqual(dep.implicitDependencies, [], 'dep.implicitDependencies');
				assert.strictEqual(dep.isEntry, false, 'dep.isEntry');
				assert.strictEqual(dep.isDynamicEntry, false, 'dep.isDynamicEntry');
				assert.strictEqual(dep.isImplicitEntry, true, 'dep.isImplicitEntry');
			}
		}
	}
};
