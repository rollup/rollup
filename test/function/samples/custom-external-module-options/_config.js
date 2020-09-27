const assert = require('assert');
const path = require('path');

module.exports = {
	description: 'supports adding custom options to external modules',
	options: {
		plugins: [
			{
				name: 'test-plugin',
				async resolveId(id) {
					if (id === 'external') {
						return { id, external: true, meta: { 'test-plugin': { resolved: true } } };
					}
				}
			},
			{
				name: 'wrap-up',
				buildEnd() {
					assert.deepStrictEqual(this.getModuleInfo('external'), {
						dynamicallyImportedIds: [],
						dynamicImporters: [],
						hasModuleSideEffects: true,
						id: 'external',
						implicitlyLoadedAfterOneOf: [],
						implicitlyLoadedBefore: [],
						importedIds: [],
						importers: [path.join(__dirname, 'main.js')],
						isEntry: false,
						isExternal: true,
						meta: {}
					});
				}
			}
		]
	}
};
