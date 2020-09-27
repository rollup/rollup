const assert = require('assert');
const path = require('path');

function getId(name) {
	return path.resolve(__dirname, `${name}.js`);
}

module.exports = {
	description: 'provides additional chunk information to a manualChunks function',
	options: {
		external: 'external',
		output: {
			manualChunks(id, { getModuleIds, getModuleInfo }) {
				assert.deepStrictEqual(
					[...getModuleIds()],
					[getId('main'), 'external', getId('lib'), getId('dynamic')]
				);
				assert.deepStrictEqual(
					[...getModuleIds()].map(id => getModuleInfo(id)),
					[
						{
							dynamicImporters: [],
							dynamicallyImportedIds: [getId('dynamic')],
							hasModuleSideEffects: true,
							id: getId('main'),
							implicitlyLoadedAfterOneOf: [],
							implicitlyLoadedBefore: [],
							importers: [],
							importedIds: [getId('lib'), 'external'],
							isEntry: true,
							isExternal: false,
							meta: {}
						},
						{
							dynamicImporters: [getId('dynamic')],
							dynamicallyImportedIds: [],
							hasModuleSideEffects: true,
							id: 'external',
							implicitlyLoadedAfterOneOf: [],
							implicitlyLoadedBefore: [],
							importers: [getId('main')],
							importedIds: [],
							isEntry: false,
							isExternal: true,
							meta: {}
						},
						{
							dynamicImporters: [],
							dynamicallyImportedIds: [],
							hasModuleSideEffects: true,
							id: getId('lib'),
							implicitlyLoadedAfterOneOf: [],
							implicitlyLoadedBefore: [],
							importers: [getId('dynamic'), getId('main')],
							importedIds: [],
							isEntry: false,
							isExternal: false,
							meta: {}
						},
						{
							dynamicImporters: [getId('main')],
							dynamicallyImportedIds: ['external'],
							hasModuleSideEffects: true,
							id: getId('dynamic'),
							implicitlyLoadedAfterOneOf: [],
							implicitlyLoadedBefore: [],
							importers: [],
							importedIds: [getId('lib')],
							isEntry: false,
							isExternal: false,
							meta: {}
						}
					]
				);
			}
		}
	}
};
