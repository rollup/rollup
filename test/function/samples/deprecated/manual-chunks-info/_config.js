const assert = require('assert');
const path = require('path');

function getId(name) {
	return path.join(__dirname, `${name}.js`);
}

module.exports = {
	description: 'provides additional chunk information to a manualChunks function',
	options: {
		strictDeprecations: false,
		external: 'external',
		output: {
			manualChunks(id, { getModuleIds, getModuleInfo }) {
				assert.deepStrictEqual(
					[...getModuleIds()],
					[getId('main'), 'external', getId('lib'), getId('dynamic')]
				);
				assert.deepStrictEqual(
					JSON.parse(JSON.stringify([...getModuleIds()].map(id => getModuleInfo(id)))),
					[
						{
							ast: {
								type: 'Program',
								start: 0,
								end: 123,
								body: [
									{
										type: 'ExportNamedDeclaration',
										start: 0,
										end: 43,
										declaration: {
											type: 'VariableDeclaration',
											start: 7,
											end: 43,
											declarations: [
												{
													type: 'VariableDeclarator',
													start: 13,
													end: 42,
													id: { type: 'Identifier', start: 13, end: 20, name: 'promise' },
													init: {
														type: 'ImportExpression',
														start: 23,
														end: 42,
														source: {
															type: 'Literal',
															start: 30,
															end: 41,
															value: './dynamic',
															raw: "'./dynamic'"
														}
													}
												}
											],
											kind: 'const'
										},
										specifiers: [],
										source: null
									},
									{
										type: 'ExportNamedDeclaration',
										start: 44,
										end: 85,
										declaration: null,
										specifiers: [
											{
												type: 'ExportSpecifier',
												start: 53,
												end: 69,
												local: { type: 'Identifier', start: 53, end: 60, name: 'default' },
												exported: { type: 'Identifier', start: 64, end: 69, name: 'value' }
											}
										],
										source: { type: 'Literal', start: 77, end: 84, value: './lib', raw: "'./lib'" }
									},
									{
										type: 'ExportNamedDeclaration',
										start: 86,
										end: 122,
										declaration: null,
										specifiers: [
											{
												type: 'ExportSpecifier',
												start: 95,
												end: 103,
												local: { type: 'Identifier', start: 95, end: 103, name: 'external' },
												exported: { type: 'Identifier', start: 95, end: 103, name: 'external' }
											}
										],
										source: {
											type: 'Literal',
											start: 111,
											end: 121,
											value: 'external',
											raw: "'external'"
										}
									}
								],
								sourceType: 'module'
							},
							code: "export const promise = import('./dynamic');\nexport { default as value } from './lib';\nexport { external } from 'external';\n",
							dynamicallyImportedIds: [getId('dynamic')],
							dynamicImporters: [],
							hasModuleSideEffects: true,
							id: getId('main'),
							implicitlyLoadedAfterOneOf: [],
							implicitlyLoadedBefore: [],
							importedIds: [getId('lib'), 'external'],
							importers: [],
							isEntry: true,
							isExternal: false,
							isIncluded: true,
							meta: {},
							syntheticNamedExports: false
						},
						{
							ast: null,
							code: null,
							dynamicallyImportedIds: [],
							dynamicImporters: [getId('dynamic')],
							hasModuleSideEffects: true,
							id: 'external',
							implicitlyLoadedAfterOneOf: [],
							implicitlyLoadedBefore: [],
							importedIds: [],
							importers: [getId('main')],
							isEntry: false,
							isExternal: true,
							isIncluded: null,
							meta: {},
							syntheticNamedExports: false
						},
						{
							ast: {
								type: 'Program',
								start: 0,
								end: 19,
								body: [
									{
										type: 'ExportDefaultDeclaration',
										start: 0,
										end: 18,
										declaration: { type: 'Literal', start: 15, end: 17, value: 42, raw: '42' }
									}
								],
								sourceType: 'module'
							},
							code: 'export default 42;\n',
							dynamicallyImportedIds: [],
							dynamicImporters: [],
							hasModuleSideEffects: true,
							id: getId('lib'),
							implicitlyLoadedAfterOneOf: [],
							implicitlyLoadedBefore: [],
							importedIds: [],
							importers: [getId('dynamic'), getId('main')],
							isEntry: false,
							isExternal: false,
							isIncluded: true,
							meta: {},
							syntheticNamedExports: false
						},
						{
							ast: {
								type: 'Program',
								start: 0,
								end: 88,
								body: [
									{
										type: 'ExportNamedDeclaration',
										start: 0,
										end: 42,
										declaration: {
											type: 'VariableDeclaration',
											start: 7,
											end: 42,
											declarations: [
												{
													type: 'VariableDeclarator',
													start: 13,
													end: 41,
													id: { type: 'Identifier', start: 13, end: 20, name: 'promise' },
													init: {
														type: 'ImportExpression',
														start: 23,
														end: 41,
														source: {
															type: 'Literal',
															start: 30,
															end: 40,
															value: 'external',
															raw: "'external'"
														}
													}
												}
											],
											kind: 'const'
										},
										specifiers: [],
										source: null
									},
									{
										type: 'ExportNamedDeclaration',
										start: 43,
										end: 87,
										declaration: null,
										specifiers: [
											{
												type: 'ExportSpecifier',
												start: 52,
												end: 71,
												local: { type: 'Identifier', start: 52, end: 59, name: 'default' },
												exported: { type: 'Identifier', start: 63, end: 71, name: 'internal' }
											}
										],
										source: { type: 'Literal', start: 79, end: 86, value: './lib', raw: "'./lib'" }
									}
								],
								sourceType: 'module'
							},
							code: "export const promise = import('external');\nexport { default as internal } from './lib';\n",
							dynamicallyImportedIds: ['external'],
							dynamicImporters: [getId('main')],
							hasModuleSideEffects: true,
							id: getId('dynamic'),
							implicitlyLoadedAfterOneOf: [],
							implicitlyLoadedBefore: [],
							importedIds: [getId('lib')],
							importers: [],
							isEntry: false,
							isExternal: false,
							isIncluded: true,
							meta: {},
							syntheticNamedExports: false
						}
					]
				);
			}
		}
	}
};
