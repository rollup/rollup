const assert = require('node:assert');
const {
	parseAst,
	parseAstAsync,
	parseLazyAst,
	parseAndWalk,
	serializeAst,
	deserializeAst,
	deserializeLazyAst
} = require('../../dist/parseAst');
const { rollup } = require('../../dist/rollup');
const { assertAstEqual, hasEsBuild } = require('../testHelpers');

describe('parseAst', () => {
	it('parses an AST', async () => {
		assert.deepStrictEqual(parseAst('console.log("ok")'), {
			type: 'Program',
			start: 0,
			end: 17,
			body: [
				{
					type: 'ExpressionStatement',
					start: 0,
					end: 17,
					expression: {
						type: 'CallExpression',
						start: 0,
						end: 17,
						arguments: [{ type: 'Literal', start: 12, end: 16, raw: '"ok"', value: 'ok' }],
						callee: {
							type: 'MemberExpression',
							start: 0,
							end: 11,
							computed: false,
							object: { type: 'Identifier', start: 0, end: 7, name: 'console' },
							optional: false,
							property: { type: 'Identifier', start: 8, end: 11, name: 'log' }
						},
						optional: false
					}
				}
			],
			sourceType: 'module'
		});
	});

	if (hasEsBuild) {
		it('works as an ES module', async () => {
			const { parseAst: parseEsm } = await import('../../dist/es/parseAst.js');
			assert.deepStrictEqual(parseEsm('console.log("ok")'), {
				type: 'Program',
				start: 0,
				end: 17,
				body: [
					{
						type: 'ExpressionStatement',
						start: 0,
						end: 17,
						expression: {
							type: 'CallExpression',
							start: 0,
							end: 17,
							arguments: [{ type: 'Literal', start: 12, end: 16, raw: '"ok"', value: 'ok' }],
							callee: {
								type: 'MemberExpression',
								start: 0,
								end: 11,
								computed: false,
								object: { type: 'Identifier', start: 0, end: 7, name: 'console' },
								optional: false,
								property: { type: 'Identifier', start: 8, end: 11, name: 'log' }
							},
							optional: false
						}
					}
				],
				sourceType: 'module'
			});
		});
	}

	it('throws on parse errors', async () => {
		assert.throws(() => parseAst('<=>'), {
			name: 'RollupError',
			message: 'Expression expected',
			code: 'PARSE_ERROR',
			pos: 2
		});
	});

	it('throws on return outside function by default', async () => {
		assert.throws(() => parseAst('return 42;'), {
			name: 'RollupError',
			message: 'Return statement is not allowed here',
			code: 'PARSE_ERROR',
			pos: 0
		});
	});

	it('can handle return outside function if enabled', async () => {
		assert.deepStrictEqual(parseAst('return 42;', { allowReturnOutsideFunction: true }), {
			type: 'Program',
			start: 0,
			end: 10,
			body: [
				{
					type: 'ReturnStatement',
					start: 0,
					end: 10,
					argument: { type: 'Literal', start: 7, end: 9, raw: '42', value: 42 }
				}
			],
			sourceType: 'module'
		});
	});

	it('uses the same reference for key and value of a shorthand property', async () => {
		const { key, value } = parseAst('({ foo });').body[0].expression.properties[0];
		assert.ok(key === value);
	});

	it('resolves shorthand keys of assignments to the left side of the value', async () => {
		const property = parseAst('const { x = 1 } = obj;').body[0].declarations[0].id.properties[0];
		assert.strictEqual(property.key, property.value.left);
		assert.strictEqual(property.key.type, 'Identifier');
	});

	it('uses different references for aliased specifiers and properties', async () => {
		const [shorthandProperty] = parseAst('({ foo: foo });').body[0].expression.properties;
		assert.ok(shorthandProperty.key !== shorthandProperty.value);
		const [importedSpecifier, aliasedSpecifier] = parseAst('import { x, y as z } from "m";').body[0]
			.specifiers;
		assert.ok(importedSpecifier.imported === importedSpecifier.local);
		assert.ok(aliasedSpecifier.imported !== aliasedSpecifier.local);
		const [exportedSpecifier, aliasedExportSpecifier] = parseAst(
			'const x = 1, y = 2; export { x, y as z };'
		).body[1].specifiers;
		assert.ok(exportedSpecifier.exported === exportedSpecifier.local);
		assert.ok(aliasedExportSpecifier.exported !== aliasedExportSpecifier.local);
		const [sameNameSpecifier] = parseAst('import { x as x } from "m";').body[0].specifiers;
		assert.ok(sameNameSpecifier.imported !== sameNameSpecifier.local);
		const [sameNameExport] = parseAst('const x = 1; export { x as x };').body[1].specifiers;
		assert.ok(sameNameExport.exported !== sameNameExport.local);
	});

	it('does not add parents to nodes of eager ASTs', async () => {
		const ast = parseAst('const x = foo;');
		assert.ok(!('parent' in ast));
		assert.ok(!('parent' in ast.body[0]));
		assert.ok(!('parent' in ast.body[0].declarations[0].init));
		assert.strictEqual(ast.body[0].declarations[0].init.parent, undefined);
	});

	it('preserves parents when serializing and deserializing', async () => {
		const ast = parseLazyAst('const x = foo;');
		const deserialized = deserializeLazyAst(serializeAst(ast));
		assert.strictEqual(deserialized.parent, null);
		assert.strictEqual(deserialized.body[0].parent, deserialized);
		assert.strictEqual(deserialized.body[0].declarations[0].parent, deserialized.body[0]);
		assert.ok(deserializeAst(serializeAst(parseAst('const x = foo;'))));
	});

	it('can deserialize AST buffers that are views at a non-zero byte offset', async () => {
		const ast = parseAst('console.log("ok")');
		const buffer = serializeAst(ast);
		const paddedBuffer = new Uint8Array(buffer.byteLength + 4);
		paddedBuffer.set(buffer, 4);
		const view = paddedBuffer.subarray(4);
		assert.strictEqual(view.byteOffset, 4);
		assert.deepStrictEqual(deserializeAst(view), ast);
		assertAstEqual(deserializeLazyAst(view), ast);
	});

	it('can deserialize AST buffers that are views at a byte offset that is not a multiple of 4', async () => {
		const ast = parseAst('console.log("ok")');
		const buffer = serializeAst(ast);
		const paddedBuffer = new Uint8Array(buffer.byteLength + 1);
		paddedBuffer.set(buffer, 1);
		const view = paddedBuffer.subarray(1);
		assert.strictEqual(view.byteOffset, 1);
		assert.deepStrictEqual(deserializeAst(view), ast);
		assertAstEqual(deserializeLazyAst(view), ast);
	});
});

describe('parseAstAsync', () => {
	it('parses an AST', async () => {
		assert.deepStrictEqual(await parseAstAsync('console.log("ok")'), {
			type: 'Program',
			start: 0,
			end: 17,
			body: [
				{
					type: 'ExpressionStatement',
					start: 0,
					end: 17,
					expression: {
						type: 'CallExpression',
						start: 0,
						end: 17,
						arguments: [{ type: 'Literal', start: 12, end: 16, raw: '"ok"', value: 'ok' }],
						callee: {
							type: 'MemberExpression',
							start: 0,
							end: 11,
							computed: false,
							object: { type: 'Identifier', start: 0, end: 7, name: 'console' },
							optional: false,
							property: { type: 'Identifier', start: 8, end: 11, name: 'log' }
						},
						optional: false
					}
				}
			],
			sourceType: 'module'
		});
	});
});

describe('lazy AST parents', () => {
	it('links nodes to their parents without exposing them as own properties', () => {
		const ast = parseLazyAst('const x = foo;');
		const variableDeclaration = ast.body[0];
		const declarator = variableDeclaration.declarations[0];
		assert.strictEqual(ast.parent, null);
		assert.strictEqual(variableDeclaration.parent, ast);
		assert.strictEqual(declarator.parent, variableDeclaration);
		assert.strictEqual(declarator.id.parent, declarator);
		assert.strictEqual(declarator.init.parent, declarator);
		assert.strictEqual(declarator.init.name, 'foo');
		assert.deepStrictEqual(Object.keys(declarator), ['start', 'end']);
		assert.strictEqual(Object.hasOwn(declarator, 'parent'), false);
		assert.strictEqual('parent' in declarator, true);
		assert.deepStrictEqual(JSON.parse(JSON.stringify(ast)), {
			end: 14,
			start: 0
		});
	});

	it('enumerates child fields in for…in loops but not the parent', () => {
		const declarator = parseLazyAst('const x = foo;').body[0].declarations[0];
		const enumeratedKeys = [];
		let hasVisitedChildObject = false;
		for (const key in declarator) {
			enumeratedKeys.push(key);
			const value = declarator[key];
			if (value !== null && typeof value === 'object') hasVisitedChildObject = true;
		}
		assert.ok(hasVisitedChildObject);
		assert.strictEqual(enumeratedKeys.includes('parent'), false);
		for (const key of ['type', 'start', 'end', 'id', 'init']) {
			assert.ok(enumeratedKeys.includes(key), key);
		}
	});

	it('returns the parent from the child field of the parent', () => {
		const ast = parseLazyAst('const { x } = obj;');
		const pattern = ast.body[0].declarations[0].id;
		const property = pattern.properties[0];
		assert.strictEqual(property.parent, pattern);
		assert.strictEqual(property.parent.properties[0], property);
		assert.strictEqual(property.parent.parent, ast.body[0].declarations[0]);
	});

	it('links shorthand keys of assignments to the assignment pattern', () => {
		const property =
			parseLazyAst('const { x = 1 } = obj;').body[0].declarations[0].id.properties[0];
		assert.strictEqual(property.key, property.value.left);
		assert.strictEqual(property.key.parent, property.value);
		assert.strictEqual(property.key.parent.type, 'AssignmentPattern');
	});

	it('links decorators of exported classes to the class and the class to the export', () => {
		for (const code of [
			'@dec export class X {}',
			'export @dec class X {}',
			'@dec export default class {}',
			'export default @dec class {}'
		]) {
			const ast = parseLazyAst(code);
			const exportNode = ast.body[0];
			const classNode = exportNode.declaration;
			const [decorator] = classNode.decorators;
			assert.strictEqual(exportNode.parent, ast, code);
			assert.strictEqual(classNode.parent, exportNode, code);
			assert.strictEqual(decorator.parent, classNode, code);
			assert.strictEqual(classNode.decorators[0], decorator, code);
			assert.strictEqual(decorator.expression.parent, decorator, code);
		}
	});

	it('links the source of a dynamic import to the import expression', () => {
		const importExpression = parseLazyAst('import("mod");').body[0].expression;
		assert.strictEqual(importExpression.source.parent.type, 'ImportExpression');
		assert.strictEqual(importExpression.source.parent.source, importExpression.source);
	});

	it('returns the same parent on repeated access', () => {
		const ast = parseLazyAst('const x = foo;');
		const declarator = ast.body[0].declarations[0];
		assert.strictEqual(declarator.parent, declarator.parent);
	});

	it('links decorators of exported classes through walk entries', async () => {
		for (const [code, exportType] of [
			['@dec export class X {}', 'ExportNamedDeclaration'],
			['export @dec class X {}', 'ExportNamedDeclaration'],
			['@dec export default class {}', 'ExportDefaultDeclaration'],
			['export default @dec class {}', 'ExportDefaultDeclaration']
		]) {
			let classNode;
			let classParentType;
			let decorator;
			let decoratorParent;
			await parseAndWalk(code, {
				ClassDeclaration(node) {
					classParentType = node.parent.type;
					classNode = node;
				},
				Decorator(node) {
					decoratorParent = node.parent;
					decorator = node;
				}
			});
			assert.strictEqual(classParentType, exportType, code);
			assert.strictEqual(decoratorParent, classNode, code);
			assert.strictEqual(classNode.decorators[0], decorator, code);
		}
	});

	it('gives the program a null parent when walking', async () => {
		let programParent = 'unset';
		let hasOwnParent = true;
		await parseAndWalk('const x = foo;', {
			Program(node) {
				hasOwnParent = Object.hasOwn(node, 'parent');
				programParent = node.parent;
			}
		});
		assert.strictEqual(programParent, null);
		assert.strictEqual(hasOwnParent, false);
	});

	it('returns the same parent on repeated calls', async () => {
		let parents;
		await parseAndWalk('const x = foo;', {
			Identifier(node) {
				if (node.name !== 'foo') return;
				parents = [node.parent, node.parent];
			}
		});
		assert.strictEqual(parents[0], parents[1]);
		assert.strictEqual(parents[0].type, 'VariableDeclarator');
	});

	it('resolves parents when deserializing a fragment at a non-zero position', () => {
		const buffer = serializeAst(parseAst('const x = foo;'));
		const words = new Uint32Array(buffer.buffer, buffer.byteOffset, buffer.byteLength / 4);
		const declarationPosition = words[words[4] + 1];
		const declaration = deserializeLazyAst(buffer, declarationPosition);
		assert.strictEqual(declaration.type, 'VariableDeclaration');
		assert.strictEqual(declaration.parent.type, 'Program');
		assert.strictEqual(declaration.parent.body[0], declaration);
	});

	it('keeps parent links of dynamic import sources consistent in a build', async () => {
		let checks;
		await rollup({
			input: 'main',
			onwarn() {},
			plugins: [
				{
					load: id => (id === 'main' ? 'import(`./${a}.js`);\nimport(`./${b}.js`);\n' : null),
					moduleParsed(moduleInfo) {
						const [firstExpression, secondExpression] = moduleInfo.ast.body.map(
							node => node.expression
						);
						const secondSource = secondExpression.source;
						const program = firstExpression.parent.parent;
						checks = [
							program.body[1].expression,
							program.body[1].expression.source,
							secondSource,
							secondExpression,
							secondSource.parent
						];
					},
					name: 'parent-links',
					resolveId: id => (id === 'main' ? id : null)
				}
			]
		});
		const [secondExpressionNode, materializedSource, secondSource, secondExpression, parent] =
			checks;
		assert.strictEqual(secondExpressionNode, secondExpression);
		assert.strictEqual(materializedSource, secondSource);
		assert.strictEqual(parent, secondExpression);
		assert.strictEqual(parent.source, secondSource);
	});

	it('keeps the same node identity across visitors and parent links in parseAndWalk', async () => {
		const identifiers = new Map();
		const declarators = [];
		let otherParent;
		await parseAndWalk('const value = other + 1;', {
			Identifier(node) {
				if (identifiers.has(node.name)) {
					assert.strictEqual(identifiers.get(node.name), node);
				}
				if (node.name === 'other') {
					otherParent = node.parent;
				}
				identifiers.set(node.name, node);
			},
			VariableDeclarator(node) {
				declarators.push(node);
			}
		});
		const [declarator] = declarators;
		assert.strictEqual(declarator.id, identifiers.get('value'));
		assert.strictEqual(declarator.id.parent, declarator);
		assert.strictEqual(declarator.init.parent, declarator);
		assert.strictEqual(otherParent, declarator.init);
	});
});
