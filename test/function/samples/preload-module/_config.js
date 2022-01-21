const assert = require('assert');
const path = require('path');
const ID_MAIN = path.join(__dirname, 'main.js');
const ID_DEP = path.join(__dirname, 'dep.js');
const ID_OTHER = path.join(__dirname, 'other.js');

const loadedModules = [];
const transformedModules = [];
const parsedModules = [];

module.exports = {
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
							code: "import './dep';\nassert.ok(true);\n",
							dynamicImporters: [],
							dynamicallyImportedIdResolutions: [],
							dynamicallyImportedIds: [],
							hasModuleSideEffects: true,
							id: ID_MAIN,
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
						assert.strictEqual(loadedModules.filter(id => id === ID_MAIN, 'loaded').length, 1);
						assert.strictEqual(
							transformedModules.filter(id => id === ID_MAIN, 'transformed').length,
							1
						);
						assert.strictEqual(parsedModules.filter(id => id === ID_MAIN, 'parsed').length, 0);
						// No dependencies have been loaded yet
						assert.deepStrictEqual([...this.getModuleIds()], [ID_MAIN]);
						await this.load({ id: ID_OTHER });
						assert.deepStrictEqual([...this.getModuleIds()], [ID_MAIN, ID_OTHER]);
						return resolvedId;
					}
				},
				async buildEnd(err) {
					if (err) {
						return;
					}
					const { ast, ...moduleInfo } = await this.load({
						id: ID_DEP,
						// This should be ignored as the module was already loaded
						meta: { testPlugin: 'second' }
					});
					assert.deepStrictEqual(moduleInfo, {
						code: 'assert.ok(true);\n',
						dynamicImporters: [],
						dynamicallyImportedIdResolutions: [],
						dynamicallyImportedIds: [],
						hasModuleSideEffects: true,
						id: ID_DEP,
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
					assert.strictEqual(loadedModules.filter(id => id === ID_DEP, 'loaded').length, 1);
					assert.strictEqual(
						transformedModules.filter(id => id === ID_DEP, 'transformed').length,
						1
					);
					assert.strictEqual(parsedModules.filter(id => id === ID_DEP, 'parsed').length, 1);
					assert.deepStrictEqual([...this.getModuleIds()], [ID_MAIN, ID_OTHER, ID_DEP]);
				}
			}
		]
	}
};
