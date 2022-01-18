const assert = require('assert');
const path = require('path');

const ID_MAIN = path.join(__dirname, 'main.js');
const ID_FOO = path.join(__dirname, 'foo.js');
const ID_NESTED = path.join(__dirname, 'nested', 'nested.js');
const ID_PATH = 'path';

let rendered = false;

module.exports = {
	description: 'provides module information on the plugin context',
	options: {
		external: ['path'],
		plugins: {
			load(id) {
				assert.deepStrictEqual(this.getModuleInfo(id), {
					ast: null,
					code: null,
					dynamicImporters: [],
					dynamicallyImportedIdResolutions: [],
					dynamicallyImportedIds: [],
					hasModuleSideEffects: true,
					id,
					implicitlyLoadedAfterOneOf: [],
					implicitlyLoadedBefore: [],
					importedIdResolutions: [],
					importedIds: [],
					importers: [],
					isEntry: id === ID_MAIN,
					isExternal: false,
					isIncluded: null,
					meta: {},
					syntheticNamedExports: false
				});
			},
			renderStart() {
				rendered = true;
				assert.deepStrictEqual([...this.getModuleIds()], [ID_MAIN, ID_FOO, ID_PATH, ID_NESTED]);
				assert.deepStrictEqual(
					JSON.parse(JSON.stringify([...this.getModuleIds()].map(id => this.getModuleInfo(id)))),
					[
						{
							ast: {
								type: 'Program',
								start: 0,
								end: 159,
								body: [
									{
										type: 'ExportNamedDeclaration',
										start: 0,
										end: 31,
										declaration: null,
										specifiers: [
											{
												type: 'ExportSpecifier',
												start: 9,
												end: 12,
												local: { type: 'Identifier', start: 9, end: 12, name: 'foo' },
												exported: { type: 'Identifier', start: 9, end: 12, name: 'foo' }
											}
										],
										source: {
											type: 'Literal',
											start: 20,
											end: 30,
											value: './foo.js',
											raw: "'./foo.js'"
										}
									},
									{
										type: 'ExportNamedDeclaration',
										start: 32,
										end: 80,
										declaration: {
											type: 'VariableDeclaration',
											start: 39,
											end: 80,
											declarations: [
												{
													type: 'VariableDeclarator',
													start: 45,
													end: 79,
													id: { type: 'Identifier', start: 45, end: 51, name: 'nested' },
													init: {
														type: 'ImportExpression',
														start: 54,
														end: 79,
														source: {
															type: 'Literal',
															start: 61,
															end: 78,
															value: './nested/nested',
															raw: "'./nested/nested'"
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
										start: 81,
										end: 116,
										declaration: {
											type: 'VariableDeclaration',
											start: 88,
											end: 116,
											declarations: [
												{
													type: 'VariableDeclarator',
													start: 94,
													end: 115,
													id: { type: 'Identifier', start: 94, end: 98, name: 'path' },
													init: {
														type: 'ImportExpression',
														start: 101,
														end: 115,
														source: {
															type: 'Literal',
															start: 108,
															end: 114,
															value: 'path',
															raw: "'path'"
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
										start: 117,
										end: 158,
										declaration: {
											type: 'VariableDeclaration',
											start: 124,
											end: 158,
											declarations: [
												{
													type: 'VariableDeclarator',
													start: 130,
													end: 157,
													id: { type: 'Identifier', start: 130, end: 139, name: 'pathAgain' },
													init: {
														type: 'ImportExpression',
														start: 142,
														end: 157,
														source: { type: 'Identifier', start: 149, end: 156, name: 'thePath' }
													}
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
							code: "export { foo } from './foo.js';\nexport const nested = import('./nested/nested');\nexport const path = import('path');\nexport const pathAgain = import(thePath);\n",
							dynamicallyImportedIdResolutions: [
								{
									external: false,
									id: ID_NESTED,
									meta: {},
									moduleSideEffects: true,
									syntheticNamedExports: false
								},
								{
									external: true,
									id: ID_PATH,
									meta: {},
									moduleSideEffects: true,
									syntheticNamedExports: false
								}
							],
							dynamicallyImportedIds: [ID_NESTED, ID_PATH],
							dynamicImporters: [],
							hasModuleSideEffects: true,
							id: ID_MAIN,
							implicitlyLoadedAfterOneOf: [],
							implicitlyLoadedBefore: [],
							importedIdResolutions: [
								{
									external: false,
									id: ID_FOO,
									meta: {},
									moduleSideEffects: true,
									syntheticNamedExports: false
								}
							],
							importedIds: [ID_FOO],
							importers: [],
							isEntry: true,
							isExternal: false,
							isIncluded: true,
							meta: {},
							syntheticNamedExports: false
						},
						{
							ast: {
								type: 'Program',
								start: 0,
								end: 66,
								body: [
									{
										type: 'ImportDeclaration',
										start: 0,
										end: 24,
										specifiers: [
											{
												type: 'ImportDefaultSpecifier',
												start: 7,
												end: 11,
												local: { type: 'Identifier', start: 7, end: 11, name: 'path' }
											}
										],
										source: { type: 'Literal', start: 17, end: 23, value: 'path', raw: "'path'" }
									},
									{
										type: 'ExportNamedDeclaration',
										start: 26,
										end: 65,
										declaration: {
											type: 'VariableDeclaration',
											start: 33,
											end: 65,
											declarations: [
												{
													type: 'VariableDeclarator',
													start: 39,
													end: 64,
													id: { type: 'Identifier', start: 39, end: 42, name: 'foo' },
													init: {
														type: 'CallExpression',
														start: 45,
														end: 64,
														callee: {
															type: 'MemberExpression',
															start: 45,
															end: 57,
															object: { type: 'Identifier', start: 45, end: 49, name: 'path' },
															property: { type: 'Identifier', start: 50, end: 57, name: 'resolve' },
															computed: false,
															optional: false
														},
														arguments: [
															{ type: 'Literal', start: 58, end: 63, value: 'foo', raw: "'foo'" }
														],
														optional: false
													}
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
							code: "import path from 'path';\n\nexport const foo = path.resolve('foo');\n",
							dynamicallyImportedIdResolutions: [],
							dynamicallyImportedIds: [],
							dynamicImporters: [],
							hasModuleSideEffects: true,
							id: ID_FOO,
							implicitlyLoadedAfterOneOf: [],
							implicitlyLoadedBefore: [],
							importedIdResolutions: [
								{
									external: true,
									id: ID_PATH,
									meta: {},
									moduleSideEffects: true,
									syntheticNamedExports: false
								}
							],
							importedIds: [ID_PATH],
							importers: [ID_MAIN, ID_NESTED],
							isEntry: false,
							isExternal: false,
							isIncluded: true,
							meta: {},
							syntheticNamedExports: false
						},
						{
							ast: null,
							code: null,
							dynamicallyImportedIdResolutions: [],
							dynamicallyImportedIds: [],
							dynamicImporters: [ID_MAIN],
							hasModuleSideEffects: true,
							id: ID_PATH,
							implicitlyLoadedAfterOneOf: [],
							implicitlyLoadedBefore: [],
							importedIdResolutions: [],
							importedIds: [],
							importers: [ID_FOO],
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
								end: 72,
								body: [
									{
										type: 'ImportDeclaration',
										start: 0,
										end: 32,
										specifiers: [
											{
												type: 'ImportSpecifier',
												start: 9,
												end: 12,
												imported: { type: 'Identifier', start: 9, end: 12, name: 'foo' },
												local: { type: 'Identifier', start: 9, end: 12, name: 'foo' }
											}
										],
										source: {
											type: 'Literal',
											start: 20,
											end: 31,
											value: '../foo.js',
											raw: "'../foo.js'"
										}
									},
									{
										type: 'ExportNamedDeclaration',
										start: 34,
										end: 71,
										declaration: {
											type: 'VariableDeclaration',
											start: 41,
											end: 71,
											declarations: [
												{
													type: 'VariableDeclarator',
													start: 47,
													end: 70,
													id: { type: 'Identifier', start: 47, end: 53, name: 'nested' },
													init: {
														type: 'BinaryExpression',
														start: 56,
														end: 70,
														left: {
															type: 'Literal',
															start: 56,
															end: 64,
															value: 'nested',
															raw: "'nested'"
														},
														operator: '+',
														right: { type: 'Identifier', start: 67, end: 70, name: 'foo' }
													}
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
							code: "import { foo } from '../foo.js';\n\nexport const nested = 'nested' + foo;\n",
							dynamicallyImportedIdResolutions: [],
							dynamicallyImportedIds: [],
							dynamicImporters: [ID_MAIN],
							hasModuleSideEffects: true,
							id: ID_NESTED,
							implicitlyLoadedAfterOneOf: [],
							implicitlyLoadedBefore: [],
							importedIdResolutions: [
								{
									external: false,
									id: ID_FOO,
									meta: {},
									moduleSideEffects: true,
									syntheticNamedExports: false
								}
							],
							importedIds: [ID_FOO],
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
	},
	context: {
		thePath: 'path'
	},
	bundle() {
		assert.ok(rendered);
	}
};
