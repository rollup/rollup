const assert = require('node:assert');
const path = require('node:path');

const ID_MAIN = path.join(__dirname, 'main.js');
const ID_LIB = path.join(__dirname, 'lib.js');
const ID_DEP = path.join(__dirname, 'dep.js');

module.exports = defineTest({
	description: 'makes sure emitted entry points are never implicit dependencies',
	options: {
		preserveEntrySignatures: 'allow-extension',
		plugins: {
			name: 'test-plugin',
			async buildStart() {
				this.emitFile({
					type: 'chunk',
					id: 'dep.js',
					implicitlyLoadedAfterOneOf: [ID_MAIN]
				});
				await new Promise(resolve => setTimeout(resolve, 200));
				this.emitFile({
					type: 'chunk',
					id: 'dep.js'
				});
			},
			buildEnd() {
				assert.deepStrictEqual(JSON.parse(JSON.stringify(this.getModuleInfo(ID_MAIN))), {
					id: ID_MAIN,
					attributes: {},
					ast: {
						type: 'Program',
						start: 0,
						end: 51,
						body: [
							{
								type: 'ImportDeclaration',
								start: 0,
								end: 30,
								phase: 'instance',
								source: { type: 'Literal', start: 22, end: 29, raw: "'./lib'", value: './lib' },
								specifiers: [
									{
										type: 'ImportSpecifier',
										start: 9,
										end: 14,
										imported: { type: 'Identifier', start: 9, end: 14, name: 'value' },
										local: { type: 'Identifier', start: 9, end: 14, name: 'value' }
									}
								],
								attributes: []
							},
							{
								type: 'ExpressionStatement',
								start: 31,
								end: 50,
								expression: {
									type: 'CallExpression',
									start: 31,
									end: 49,
									arguments: [{ type: 'Identifier', start: 43, end: 48, name: 'value' }],
									callee: {
										type: 'MemberExpression',
										start: 31,
										end: 42,
										computed: false,
										object: { type: 'Identifier', start: 31, end: 38, name: 'console' },
										optional: false,
										property: { type: 'Identifier', start: 39, end: 42, name: 'log' }
									},
									optional: false
								}
							}
						],
						sourceType: 'module'
					},
					code: "import { value } from './lib';\nconsole.log(value);\n",
					dynamicallyImportedIdResolutions: [],
					dynamicallyImportedIds: [],
					dynamicImporters: [],
					exportedBindings: {
						'.': []
					},
					exports: [],
					hasDefaultExport: false,
					moduleSideEffects: true,
					implicitlyLoadedAfterOneOf: [],
					implicitlyLoadedBefore: [],
					importedIdResolutions: [
						{
							attributes: {},
							external: false,
							id: ID_LIB,
							meta: {},
							moduleSideEffects: true,
							resolvedBy: 'rollup',
							syntheticNamedExports: false
						}
					],
					importedIds: [ID_LIB],
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
						end: 51,
						body: [
							{
								type: 'ImportDeclaration',
								start: 0,
								end: 30,
								phase: 'instance',
								source: { type: 'Literal', start: 22, end: 29, raw: "'./lib'", value: './lib' },
								specifiers: [
									{
										type: 'ImportSpecifier',
										start: 9,
										end: 14,
										imported: { type: 'Identifier', start: 9, end: 14, name: 'value' },
										local: { type: 'Identifier', start: 9, end: 14, name: 'value' }
									}
								],
								attributes: []
							},
							{
								type: 'ExpressionStatement',
								start: 31,
								end: 50,
								expression: {
									type: 'CallExpression',
									start: 31,
									end: 49,
									arguments: [{ type: 'Identifier', start: 43, end: 48, name: 'value' }],
									callee: {
										type: 'MemberExpression',
										start: 31,
										end: 42,
										computed: false,
										object: { type: 'Identifier', start: 31, end: 38, name: 'console' },
										optional: false,
										property: { type: 'Identifier', start: 39, end: 42, name: 'log' }
									},
									optional: false
								}
							}
						],
						sourceType: 'module'
					},
					code: "import { value } from './lib';\nconsole.log(value);\n",
					dynamicallyImportedIdResolutions: [],
					dynamicallyImportedIds: [],
					dynamicImporters: [],
					exportedBindings: {
						'.': []
					},
					exports: [],
					hasDefaultExport: false,
					moduleSideEffects: true,
					implicitlyLoadedAfterOneOf: [],
					implicitlyLoadedBefore: [],
					importedIdResolutions: [
						{
							attributes: {},
							external: false,
							id: ID_LIB,
							meta: {},
							moduleSideEffects: true,
							resolvedBy: 'rollup',
							syntheticNamedExports: false
						}
					],
					importedIds: [ID_LIB],
					importers: [],
					isEntry: true,
					isExternal: false,
					isIncluded: true,
					meta: {},
					syntheticNamedExports: false
				});
			},
			generateBundle(options, bundle) {
				const main = bundle['main.js'];
				assert.deepStrictEqual(main.implicitlyLoadedBefore, [], 'main.implicitlyLoadedBefore');
				assert.strictEqual(main.isEntry, true, 'main.isEntry');
				assert.strictEqual(main.isDynamicEntry, false, 'main.isDynamicEntry');
				assert.strictEqual(main.isImplicitEntry, false, 'main.isImplicitEntry');
				const dep = bundle['generated-dep.js'];
				assert.deepStrictEqual(dep.implicitlyLoadedBefore, [], 'dep.implicitlyLoadedBefore');
				assert.strictEqual(dep.isEntry, true, 'dep.isEntry');
				assert.strictEqual(dep.isDynamicEntry, false, 'dep.isDynamicEntry');
				assert.strictEqual(dep.isImplicitEntry, false, 'dep.isImplicitEntry');
			},
			async transform(code, id) {
				if (id.endsWith('main.js')) {
					// This delay used to cause a race condition
					await new Promise(resolve => setTimeout(resolve, 200));
				}
			}
		}
	}
});
