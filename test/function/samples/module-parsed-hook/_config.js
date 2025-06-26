const assert = require('node:assert');
const path = require('node:path');

const parsedModules = [];

const ID_MAIN = path.join(__dirname, 'main.js');
const ID_DEP = path.join(__dirname, 'dep.js');

module.exports = defineTest({
	description: 'calls the moduleParsedHook once a module is parsed',
	options: {
		plugins: [
			{
				name: 'test-plugin',
				moduleParsed(moduleInfo) {
					parsedModules.push(moduleInfo);
				},
				buildEnd() {
					assert.deepStrictEqual(JSON.parse(JSON.stringify(parsedModules)), [
						{
							id: ID_MAIN,
							attributes: {},
							ast: {
								type: 'Program',
								start: 0,
								end: 34,
								body: [
									{
										type: 'ExportNamedDeclaration',
										start: 0,
										end: 33,
										attributes: [],
										declaration: null,
										specifiers: [
											{
												type: 'ExportSpecifier',
												start: 9,
												end: 14,
												local: { type: 'Identifier', start: 9, end: 14, name: 'value' },
												exported: { type: 'Identifier', start: 9, end: 14, name: 'value' }
											}
										],
										source: {
											type: 'Literal',
											start: 22,
											end: 32,
											value: './dep.js',
											raw: "'./dep.js'"
										}
									}
								],
								sourceType: 'module'
							},
							code: "export { value } from './dep.js';\n",
							dynamicallyImportedIdResolutions: [],
							dynamicallyImportedIds: [],
							dynamicImporters: [],
							exportedBindings: { '.': [], './dep.js': ['value'] },
							exports: ['value'],
							hasDefaultExport: false,
							moduleSideEffects: true,
							implicitlyLoadedAfterOneOf: [],
							implicitlyLoadedBefore: [],
							importedIdResolutions: [
								{
									attributes: {},
									external: false,
									id: ID_DEP,
									meta: {},
									moduleSideEffects: true,
									resolvedBy: 'rollup',
									syntheticNamedExports: false
								}
							],
							importedIds: [ID_DEP],
							importers: [],
							isEntry: true,
							isExternal: false,
							isIncluded: false,
							meta: {},
							safeVariableNames: null,
							syntheticNamedExports: false
						},
						{
							id: ID_DEP,
							attributes: {},
							ast: {
								type: 'Program',
								start: 0,
								end: 25,
								body: [
									{
										type: 'ExportNamedDeclaration',
										start: 0,
										end: 24,
										attributes: [],
										declaration: {
											type: 'VariableDeclaration',
											start: 7,
											end: 24,
											declarations: [
												{
													type: 'VariableDeclarator',
													start: 13,
													end: 23,
													id: { type: 'Identifier', start: 13, end: 18, name: 'value' },
													init: { type: 'Literal', start: 21, end: 23, value: 42, raw: '42' }
												}
											],
											kind: 'const'
										},
										specifiers: [],
										source: null
									}
								],
								sourceType: 'module'
							},
							code: 'export const value = 42;\n',
							dynamicallyImportedIdResolutions: [],
							dynamicallyImportedIds: [],
							dynamicImporters: [],
							exportedBindings: { '.': ['value'] },
							exports: ['value'],
							hasDefaultExport: false,
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
							safeVariableNames: null,
							syntheticNamedExports: false
						}
					]);
				}
			}
		]
	}
});
