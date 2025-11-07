const assert = require('node:assert');
const path = require('node:path');

const ID_MAIN1 = path.join(__dirname, 'main1.js');
const ID_MAIN2 = path.join(__dirname, 'main2.js');
const ID_LIB1 = path.join(__dirname, 'lib1.js');
const ID_LIB1B = path.join(__dirname, 'lib1b.js');
const ID_LIB2 = path.join(__dirname, 'lib2.js');
const ID_LIB3 = path.join(__dirname, 'lib3.js');
const ID_DEP = path.join(__dirname, 'dep.js');

module.exports = defineTest({
	description: 'supports emitting the same chunk with different and multiple dependencies',
	options: {
		input: ['main1', 'main2'],
		plugins: {
			name: 'test-plugin',
			buildStart() {
				this.emitFile({
					type: 'chunk',
					id: 'dep.js',
					implicitlyLoadedAfterOneOf: [ID_MAIN1]
				});
				this.emitFile({
					type: 'chunk',
					id: 'dep.js',
					implicitlyLoadedAfterOneOf: [ID_MAIN1, ID_MAIN2]
				});
				this.emitFile({
					type: 'chunk',
					id: 'dep.js',
					implicitlyLoadedAfterOneOf: [ID_MAIN2]
				});
			},
			buildEnd() {
				assert.deepStrictEqual(JSON.parse(JSON.stringify(this.getModuleInfo(ID_MAIN1))), {
					id: ID_MAIN1,
					attributes: {},
					ast: {
						type: 'Program',
						start: 0,
						end: 137,
						body: [
							{
								type: 'ImportDeclaration',
								start: 0,
								end: 30,
								source: { type: 'Literal', start: 21, end: 29, raw: "'./lib1'", value: './lib1' },
								specifiers: [
									{
										type: 'ImportSpecifier',
										start: 9,
										end: 13,
										imported: { type: 'Identifier', start: 9, end: 13, name: 'lib1' },
										local: { type: 'Identifier', start: 9, end: 13, name: 'lib1' }
									}
								],
								attributes: []
							},
							{
								type: 'ImportDeclaration',
								start: 31,
								end: 63,
								source: { type: 'Literal', start: 53, end: 62, raw: "'./lib1b'", value: './lib1b' },
								specifiers: [
									{
										type: 'ImportSpecifier',
										start: 40,
										end: 45,
										imported: { type: 'Identifier', start: 40, end: 45, name: 'lib1b' },
										local: { type: 'Identifier', start: 40, end: 45, name: 'lib1b' }
									}
								],
								attributes: []
							},
							{
								type: 'ImportDeclaration',
								start: 64,
								end: 94,
								source: { type: 'Literal', start: 85, end: 93, raw: "'./lib2'", value: './lib2' },
								specifiers: [
									{
										type: 'ImportSpecifier',
										start: 73,
										end: 77,
										imported: { type: 'Identifier', start: 73, end: 77, name: 'lib2' },
										local: { type: 'Identifier', start: 73, end: 77, name: 'lib2' }
									}
								],
								attributes: []
							},
							{
								type: 'ExpressionStatement',
								start: 95,
								end: 136,
								expression: {
									type: 'CallExpression',
									start: 95,
									end: 135,
									arguments: [
										{ type: 'Literal', start: 107, end: 114, raw: "'main1'", value: 'main1' },
										{ type: 'Identifier', start: 116, end: 120, name: 'lib1' },
										{ type: 'Identifier', start: 123, end: 128, name: 'lib1b' },
										{ type: 'Identifier', start: 130, end: 134, name: 'lib2' }
									],
									callee: {
										type: 'MemberExpression',
										start: 95,
										end: 106,
										computed: false,
										object: { type: 'Identifier', start: 95, end: 102, name: 'console' },
										optional: false,
										property: { type: 'Identifier', start: 103, end: 106, name: 'log' }
									},
									optional: false
								}
							}
						],
						sourceType: 'module'
					},
					code: "import { lib1 } from './lib1';\nimport { lib1b } from './lib1b';\nimport { lib2 } from './lib2';\nconsole.log('main1', lib1,  lib1b, lib2);\n",
					dynamicallyImportedIdResolutions: [],
					dynamicallyImportedIds: [],
					dynamicImporters: [],
					exportedBindings: {
						'.': []
					},
					exports: [],
					hasDefaultExport: false,
					moduleSideEffects: true,
					safeVariableNames: null,
					implicitlyLoadedAfterOneOf: [],
					implicitlyLoadedBefore: [ID_DEP],
					importedIdResolutions: [
						{
							attributes: {},
							external: false,
							id: ID_LIB1,
							meta: {},
							moduleSideEffects: true,
							resolvedBy: 'rollup',
							syntheticNamedExports: false
						},
						{
							attributes: {},
							external: false,
							id: ID_LIB1B,
							meta: {},
							moduleSideEffects: true,
							resolvedBy: 'rollup',
							syntheticNamedExports: false
						},
						{
							attributes: {},
							external: false,
							id: ID_LIB2,
							meta: {},
							moduleSideEffects: true,
							resolvedBy: 'rollup',
							syntheticNamedExports: false
						}
					],
					importedIds: [ID_LIB1, ID_LIB1B, ID_LIB2],
					importers: [],
					isEntry: true,
					isExternal: false,
					isIncluded: true,
					meta: {},
					syntheticNamedExports: false
				});
				assert.deepStrictEqual(JSON.parse(JSON.stringify(this.getModuleInfo(ID_MAIN2))), {
					id: ID_MAIN2,
					attributes: {},
					ast: {
						type: 'Program',
						start: 0,
						end: 136,
						body: [
							{
								type: 'ImportDeclaration',
								start: 0,
								end: 30,
								source: { type: 'Literal', start: 21, end: 29, raw: "'./lib1'", value: './lib1' },
								specifiers: [
									{
										type: 'ImportSpecifier',
										start: 9,
										end: 13,
										imported: { type: 'Identifier', start: 9, end: 13, name: 'lib1' },
										local: { type: 'Identifier', start: 9, end: 13, name: 'lib1' }
									}
								],
								attributes: []
							},
							{
								type: 'ImportDeclaration',
								start: 31,
								end: 63,
								source: { type: 'Literal', start: 53, end: 62, raw: "'./lib1b'", value: './lib1b' },
								specifiers: [
									{
										type: 'ImportSpecifier',
										start: 40,
										end: 45,
										imported: { type: 'Identifier', start: 40, end: 45, name: 'lib1b' },
										local: { type: 'Identifier', start: 40, end: 45, name: 'lib1b' }
									}
								],
								attributes: []
							},
							{
								type: 'ImportDeclaration',
								start: 64,
								end: 94,
								source: { type: 'Literal', start: 85, end: 93, raw: "'./lib3'", value: './lib3' },
								specifiers: [
									{
										type: 'ImportSpecifier',
										start: 73,
										end: 77,
										imported: { type: 'Identifier', start: 73, end: 77, name: 'lib3' },
										local: { type: 'Identifier', start: 73, end: 77, name: 'lib3' }
									}
								],
								attributes: []
							},
							{
								type: 'ExpressionStatement',
								start: 95,
								end: 135,
								expression: {
									type: 'CallExpression',
									start: 95,
									end: 134,
									arguments: [
										{ type: 'Literal', start: 107, end: 114, raw: "'main2'", value: 'main2' },
										{ type: 'Identifier', start: 116, end: 120, name: 'lib1' },
										{ type: 'Identifier', start: 122, end: 127, name: 'lib1b' },
										{ type: 'Identifier', start: 129, end: 133, name: 'lib3' }
									],
									callee: {
										type: 'MemberExpression',
										start: 95,
										end: 106,
										computed: false,
										object: { type: 'Identifier', start: 95, end: 102, name: 'console' },
										optional: false,
										property: { type: 'Identifier', start: 103, end: 106, name: 'log' }
									},
									optional: false
								}
							}
						],
						sourceType: 'module'
					},
					code: "import { lib1 } from './lib1';\nimport { lib1b } from './lib1b';\nimport { lib3 } from './lib3';\nconsole.log('main2', lib1, lib1b, lib3);\n",
					dynamicallyImportedIdResolutions: [],
					dynamicallyImportedIds: [],
					dynamicImporters: [],
					exportedBindings: {
						'.': []
					},
					exports: [],
					hasDefaultExport: false,
					moduleSideEffects: true,
					safeVariableNames: null,
					implicitlyLoadedAfterOneOf: [],
					implicitlyLoadedBefore: [ID_DEP],
					importedIdResolutions: [
						{
							attributes: {},
							external: false,
							id: ID_LIB1,
							meta: {},
							moduleSideEffects: true,
							resolvedBy: 'rollup',
							syntheticNamedExports: false
						},
						{
							attributes: {},
							external: false,
							id: ID_LIB1B,
							meta: {},
							moduleSideEffects: true,
							resolvedBy: 'rollup',
							syntheticNamedExports: false
						},
						{
							attributes: {},
							external: false,
							id: ID_LIB3,
							meta: {},
							moduleSideEffects: true,
							resolvedBy: 'rollup',
							syntheticNamedExports: false
						}
					],
					importedIds: [ID_LIB1, ID_LIB1B, ID_LIB3],
					importers: [],
					isEntry: true,
					isExternal: false,
					isIncluded: true,
					meta: {},
					syntheticNamedExports: false
				});
				assert.deepStrictEqual(JSON.parse(JSON.stringify(this.getModuleInfo(ID_DEP))), {
					id: ID_DEP,
					attributes: {},
					ast: {
						type: 'Program',
						start: 0,
						end: 124,
						body: [
							{
								type: 'ImportDeclaration',
								start: 0,
								end: 30,
								source: { type: 'Literal', start: 21, end: 29, raw: "'./lib1'", value: './lib1' },
								specifiers: [
									{
										type: 'ImportSpecifier',
										start: 9,
										end: 13,
										imported: { type: 'Identifier', start: 9, end: 13, name: 'lib1' },
										local: { type: 'Identifier', start: 9, end: 13, name: 'lib1' }
									}
								],
								attributes: []
							},
							{
								type: 'ImportDeclaration',
								start: 31,
								end: 61,
								source: { type: 'Literal', start: 52, end: 60, raw: "'./lib2'", value: './lib2' },
								specifiers: [
									{
										type: 'ImportSpecifier',
										start: 40,
										end: 44,
										imported: { type: 'Identifier', start: 40, end: 44, name: 'lib2' },
										local: { type: 'Identifier', start: 40, end: 44, name: 'lib2' }
									}
								],
								attributes: []
							},
							{
								type: 'ImportDeclaration',
								start: 62,
								end: 92,
								source: { type: 'Literal', start: 83, end: 91, raw: "'./lib3'", value: './lib3' },
								specifiers: [
									{
										type: 'ImportSpecifier',
										start: 71,
										end: 75,
										imported: { type: 'Identifier', start: 71, end: 75, name: 'lib3' },
										local: { type: 'Identifier', start: 71, end: 75, name: 'lib3' }
									}
								],
								attributes: []
							},
							{
								type: 'ExpressionStatement',
								start: 93,
								end: 123,
								expression: {
									type: 'CallExpression',
									start: 93,
									end: 122,
									arguments: [
										{ type: 'Identifier', start: 105, end: 109, name: 'lib1' },
										{ type: 'Identifier', start: 111, end: 115, name: 'lib2' },
										{ type: 'Identifier', start: 117, end: 121, name: 'lib3' }
									],
									callee: {
										type: 'MemberExpression',
										start: 93,
										end: 104,
										computed: false,
										object: { type: 'Identifier', start: 93, end: 100, name: 'console' },
										optional: false,
										property: { type: 'Identifier', start: 101, end: 104, name: 'log' }
									},
									optional: false
								}
							}
						],
						sourceType: 'module'
					},
					code: "import { lib1 } from './lib1';\nimport { lib2 } from './lib2';\nimport { lib3 } from './lib3';\nconsole.log(lib1, lib2, lib3);\n",
					dynamicallyImportedIdResolutions: [],
					dynamicallyImportedIds: [],
					dynamicImporters: [],
					exportedBindings: {
						'.': []
					},
					exports: [],
					hasDefaultExport: false,
					moduleSideEffects: true,
					safeVariableNames: null,
					implicitlyLoadedAfterOneOf: [ID_MAIN1, ID_MAIN2],
					implicitlyLoadedBefore: [],
					importedIdResolutions: [
						{
							attributes: {},
							external: false,
							id: ID_LIB1,
							meta: {},
							moduleSideEffects: true,
							resolvedBy: 'rollup',
							syntheticNamedExports: false
						},
						{
							attributes: {},
							external: false,
							id: ID_LIB2,
							meta: {},
							moduleSideEffects: true,
							resolvedBy: 'rollup',
							syntheticNamedExports: false
						},
						{
							attributes: {},
							external: false,
							id: ID_LIB3,
							meta: {},
							moduleSideEffects: true,
							resolvedBy: 'rollup',
							syntheticNamedExports: false
						}
					],
					importedIds: [ID_LIB1, ID_LIB2, ID_LIB3],
					importers: [],
					isEntry: false,
					isExternal: false,
					isIncluded: true,
					meta: {},
					syntheticNamedExports: false
				});
			}
		}
	}
});
