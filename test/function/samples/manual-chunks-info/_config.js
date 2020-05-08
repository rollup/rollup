const assert = require('assert');
const path = require('path');

function getId(name) {
	return path.resolve(__dirname, `${name}.js`);
}

module.exports = {
	description: 'provides additional chunk information to a manualChunks function',
	options: {
		external: 'external',
		manualChunks(id, { getEntryModuleIds, getModuleIds, getModuleInfo }) {
			assert.deepStrictEqual([...getEntryModuleIds()], [getId('main')]);
			assert.deepStrictEqual(
				[...getModuleIds()],
				[getId('main'), 'external', getId('lib'), getId('dynamic')]
			);
			assert.deepStrictEqual(
				[...getModuleIds()].map(id => getModuleInfo(id)),
				[
					{
						dynamicallyImportedIds: [getId('dynamic')],
						hasModuleSideEffects: true,
						id: getId('main'),
						importedIds: [getId('lib'), 'external'],
						isEntry: true,
						isExternal: false
					},
					{
						dynamicallyImportedIds: [],
						hasModuleSideEffects: true,
						id: 'external',
						importedIds: [],
						isEntry: false,
						isExternal: true
					},
					{
						dynamicallyImportedIds: [],
						hasModuleSideEffects: true,
						id: getId('lib'),
						importedIds: [],
						isEntry: false,
						isExternal: false
					},
					{
						dynamicallyImportedIds: [],
						hasModuleSideEffects: true,
						id: getId('dynamic'),
						importedIds: [getId('lib')],
						isEntry: false,
						isExternal: false
					}
				]
			);
		}
	}
};
