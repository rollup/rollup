const assert = require('node:assert');
const path = require('node:path');
const ID_MAIN = path.join(__dirname, 'main.js');
const ID_DEP = path.join(__dirname, 'dep.js');
const ID_OTHER = path.join(__dirname, 'other.js');

const loadedModules = [];
const transformedModules = [];
const parsedModules = [];

module.exports = defineTest({
	description: 'allows pre-loading modules via this.load',
	options: {
		plugins: [
			{
				name: 'test-plugin',
				load(id) {
					loadedModules.push(id);
				},
				async transform(code, id) {
					transformedModules.push(id);
				},
				moduleParsed({ id }) {
					parsedModules.push(id);
				},
				async resolveId(source, importer, options) {
					if (source.endsWith('main.js')) {
						const resolvedId = await this.resolve(source, importer, { skipSelf: true, ...options });
						const { ast, ...moduleInfo } = await this.load({
							...resolvedId,
							meta: { testPlugin: 'first' }
						});
						assert.deepStrictEqual(moduleInfo, {
							id: ID_MAIN,
							assertions: {},
							code: "import './dep';\nassert.ok(true);\n",
							dynamicImporters: [],
							exportedBindings: {
								'.': []
							},
							exports: [],
							hasDefaultExport: false,
							dynamicallyImportedIdResolutions: [],
							dynamicallyImportedIds: [],
							moduleSideEffects: true,
							implicitlyLoadedAfterOneOf: [],
							implicitlyLoadedBefore: [],
							importedIdResolutions: [],
							importedIds: [],
							importers: [],
							isEntry: false,
							isExternal: false,
							isIncluded: null,
							meta: { testPlugin: 'first' },
							syntheticNamedExports: false
						});
						assert.strictEqual(loadedModules.filter(id => id === ID_MAIN).length, 1);
						assert.strictEqual(transformedModules.filter(id => id === ID_MAIN).length, 1);
						assert.strictEqual(parsedModules.filter(id => id === ID_MAIN).length, 0);
						// No dependencies have been loaded yet
						assert.deepStrictEqual([...this.getModuleIds()], [ID_MAIN]);
						await this.load({ id: ID_OTHER });
						assert.deepStrictEqual([...this.getModuleIds()].sort(), [ID_MAIN, ID_OTHER]);
						return resolvedId;
					}
				},
				async buildEnd(error) {
					if (error) {
						return;
					}
					const { ast, ...moduleInfo } = await this.load({
						id: ID_DEP,
						// This should be ignored as the module was already loaded
						meta: { testPlugin: 'second' }
					});
					assert.deepStrictEqual(moduleInfo, {
						id: ID_DEP,
						assertions: {},
						code: 'assert.ok(true);\n',
						dynamicImporters: [],
						exportedBindings: {
							'.': []
						},
						exports: [],
						hasDefaultExport: false,
						dynamicallyImportedIdResolutions: [],
						dynamicallyImportedIds: [],
						moduleSideEffects: true,
						implicitlyLoadedAfterOneOf: [],
						implicitlyLoadedBefore: [],
						importedIdResolutions: [],
						importedIds: [],
						importers: [ID_MAIN],
						isEntry: false,
						isExternal: false,
						isIncluded: true,
						meta: {},
						syntheticNamedExports: false
					});
					assert.strictEqual(loadedModules.filter(id => id === ID_DEP).length, 1);
					assert.strictEqual(transformedModules.filter(id => id === ID_DEP).length, 1);
					assert.strictEqual(parsedModules.filter(id => id === ID_DEP).length, 1);
					assert.deepStrictEqual([...this.getModuleIds()].sort(), [ID_DEP, ID_MAIN, ID_OTHER]);
				}
			}
		]
	}
});
