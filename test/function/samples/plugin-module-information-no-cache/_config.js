const assert = require('node:assert');
const path = require('node:path');

const ID_MAIN = path.join(__dirname, 'main.js');

module.exports = defineTest({
	description: 'handles accessing module information via plugins with cache disabled',
	options: {
		cache: false,
		plugins: [
			{
				renderStart() {
					const info = this.getModuleInfo(ID_MAIN);
					const ast = {
						type: 'Program',
						start: 0,
						end: 19,
						body: [
							{
								type: 'ExportDefaultDeclaration',
								start: 0,
								end: 18,
								declaration: {
									type: 'Literal',
									start: 15,
									end: 17,
									value: 42,
									raw: '42'
								}
							}
						],
						sourceType: 'module'
					};
					assert.deepStrictEqual(JSON.parse(JSON.stringify(info)), {
						attributes: {},
						ast,
						code: 'export default 42;\n',
						dynamicallyImportedIdResolutions: [],
						dynamicallyImportedIds: [],
						dynamicImporters: [],
						exportedBindings: {
							'.': ['default']
						},
						exports: ['default'],
						hasDefaultExport: true,
						id: ID_MAIN,
						implicitlyLoadedAfterOneOf: [],
						implicitlyLoadedBefore: [],
						importedIdResolutions: [],
						importedIds: [],
						importers: [],
						isEntry: true,
						isExternal: false,
						isIncluded: true,
						meta: {},
						moduleSideEffects: true,
						safeVariableNames: null,
						syntheticNamedExports: false
					});
					// Call AST again to ensure line coverage for cached getter
					assert.deepStrictEqual(JSON.parse(JSON.stringify(info.ast)), ast);
				}
			}
		]
	}
});
