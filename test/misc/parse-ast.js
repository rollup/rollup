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

	it('uses separate nodes with the same range for the key and value of a shorthand property', async () => {
		const { key, value } = parseAst('({ foo });').body[0].expression.properties[0];
		assert.ok(key !== value);
		assert.strictEqual(key.type, 'Identifier');
		assert.strictEqual(key.start, value.start);
		assert.strictEqual(key.end, value.end);
	});

	it('keeps the key of a shorthand property with a default separate from the value', async () => {
		const property = parseAst('const { x = 1 } = obj;').body[0].declarations[0].id.properties[0];
		assert.ok(property.key !== property.value.left);
		assert.strictEqual(property.key.type, 'Identifier');
		assert.strictEqual(property.key.start, property.value.left.start);
		assert.strictEqual(property.key.end, property.value.left.end);
	});

	it('links the key of a shorthand property with a default to the property', async () => {
		const visitedProperties = [];
		await parseAndWalk('const { x = 1 } = obj;', {
			Property(property) {
				visitedProperties.push(property);
			}
		});
		assert.strictEqual(visitedProperties.length, 1);
		const [property] = visitedProperties;
		assert.strictEqual(property.key.parent, property);
		assert.strictEqual(property.value.left.parent.type, 'AssignmentPattern');
	});

	it('uses separate nodes for specifiers whose local and exported names coincide', async () => {
		const [importedSpecifier] = parseAst('import { x } from "m";').body[0].specifiers;
		assert.ok(importedSpecifier.imported !== importedSpecifier.local);
		assert.strictEqual(importedSpecifier.imported.start, importedSpecifier.local.start);
		assert.strictEqual(importedSpecifier.imported.end, importedSpecifier.local.end);
		const [exportedSpecifier] = parseAst('const x = 1; export { x };').body[1].specifiers;
		assert.ok(exportedSpecifier.exported !== exportedSpecifier.local);
		assert.strictEqual(exportedSpecifier.exported.start, exportedSpecifier.local.start);
		assert.strictEqual(exportedSpecifier.exported.end, exportedSpecifier.local.end);
		const [aliasedSpecifier] = parseAst('import { x as z } from "m";').body[0].specifiers;
		assert.ok(aliasedSpecifier.imported !== aliasedSpecifier.local);
		assert.notStrictEqual(aliasedSpecifier.imported.start, aliasedSpecifier.local.start);
		const [sameNameSpecifier] = parseAst('import { x as x } from "m";').body[0].specifiers;
		assert.ok(sameNameSpecifier.imported !== sameNameSpecifier.local);
		assert.notStrictEqual(sameNameSpecifier.imported.start, sameNameSpecifier.local.start);
		const [sameNameExport] = parseAst('const x = 1; export { x as x };').body[1].specifiers;
		assert.ok(sameNameExport.exported !== sameNameExport.local);
		assert.notStrictEqual(sameNameExport.exported.start, sameNameExport.local.start);
	});

	it('keeps the exported name of a string literal re-export separate from the local name', async () => {
		const [specifier] = parseAst('export { "a b" } from "m";').body[0].specifiers;
		assert.notStrictEqual(specifier.exported, specifier.local);
		assert.strictEqual(specifier.exported.type, 'Literal');
		assert.strictEqual(specifier.exported.start, specifier.local.start);
		assert.strictEqual(specifier.exported.end, specifier.local.end);
	});

	it('links shorthand keys in parameter patterns to their property', async () => {
		const [parameter] = parseLazyAst('function f({ a = 1 }) {}').body[0].params;
		const [property] = parameter.properties;
		assert.notStrictEqual(property.key, property.value.left);
		assert.strictEqual(property.key.parent.type, 'Property');
		assert.strictEqual(property.value.left.parent.type, 'AssignmentPattern');
	});

	it('derives UTF-16 positions of duplicated nodes in sources with surrogate pairs', async () => {
		const source = "'😀'; const { x = 1 } = obj; export { obj };";
		const ast = parseAst(source);
		const keyPosition = source.indexOf('x');
		const property = ast.body[1].declarations[0].id.properties[0];
		assert.strictEqual(property.key.start, keyPosition);
		assert.strictEqual(property.key.end, keyPosition + 1);
		assert.strictEqual(property.value.left.start, keyPosition);
		assert.strictEqual(property.value.left.end, keyPosition + 1);
		const [specifier] = ast.body[2].specifiers;
		const exportedPosition = source.lastIndexOf('obj');
		assert.notStrictEqual(specifier.exported, specifier.local);
		assert.strictEqual(specifier.exported.start, exportedPosition);
		assert.strictEqual(specifier.exported.end, exportedPosition + 3);
		assert.strictEqual(specifier.local.start, exportedPosition);
		assert.strictEqual(specifier.local.end, exportedPosition + 3);
	});

	it('derives UTF-16 positions of duplicated nodes that contain multi-byte characters', async () => {
		const [specifier] = parseAst('export { "😀" } from "m";').body[0].specifiers;
		assert.notStrictEqual(specifier.exported, specifier.local);
		assert.strictEqual(specifier.exported.start, 9);
		assert.strictEqual(specifier.exported.end, 13);
		assert.strictEqual(specifier.local.start, 9);
		assert.strictEqual(specifier.local.end, 13);
		const [property] = parseAst('const { ä = 1 } = o;').body[0].declarations[0].id.properties;
		assert.notStrictEqual(property.key, property.value.left);
		assert.strictEqual(property.key.start, 8);
		assert.strictEqual(property.key.end, 9);
		assert.strictEqual(property.value.left.start, 8);
		assert.strictEqual(property.value.left.end, 9);
	});

	it('derives positions of long shorthand keys', async () => {
		const name = 'a'.repeat(300);
		const source = `const { ${name} = 1 } = obj;`;
		const [property] = parseAst(source).body[0].declarations[0].id.properties;
		assert.notStrictEqual(property.key, property.value.left);
		assert.strictEqual(property.key.start, source.indexOf(name));
		assert.strictEqual(property.key.end, source.indexOf(name) + name.length);
		assert.strictEqual(property.value.left.start, source.indexOf(name));
		assert.strictEqual(property.value.left.end, source.indexOf(name) + name.length);
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

	it('keeps shorthand keys and unaliased specifiers as separate nodes when serializing and deserializing', async () => {
		const deserialized = deserializeLazyAst(
			serializeAst(parseAst('const { x = 1, y } = obj; import { z } from "m"; export { y };'))
		);
		const [assignmentProperty, shorthandProperty] =
			deserialized.body[0].declarations[0].id.properties;
		assert.notStrictEqual(assignmentProperty.key, assignmentProperty.value.left);
		assert.strictEqual(assignmentProperty.key.start, assignmentProperty.value.left.start);
		assert.strictEqual(assignmentProperty.key.end, assignmentProperty.value.left.end);
		assert.strictEqual(assignmentProperty.key.parent, assignmentProperty);
		assert.strictEqual(assignmentProperty.value.left.parent, assignmentProperty.value);
		assert.notStrictEqual(shorthandProperty.key, shorthandProperty.value);
		assert.strictEqual(shorthandProperty.key.start, shorthandProperty.value.start);
		assert.strictEqual(shorthandProperty.key.parent, shorthandProperty);
		const [importSpecifier] = deserialized.body[1].specifiers;
		assert.notStrictEqual(importSpecifier.imported, importSpecifier.local);
		assert.strictEqual(importSpecifier.imported.start, importSpecifier.local.start);
		assert.strictEqual(importSpecifier.imported.parent, importSpecifier);
		const [exportSpecifier] = deserialized.body[2].specifiers;
		assert.notStrictEqual(exportSpecifier.exported, exportSpecifier.local);
		assert.strictEqual(exportSpecifier.exported.start, exportSpecifier.local.start);
		assert.strictEqual(exportSpecifier.exported.parent, exportSpecifier);
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

	it('links shorthand keys of assignments to their property', () => {
		const property =
			parseLazyAst('const { x = 1 } = obj;').body[0].declarations[0].id.properties[0];
		assert.notStrictEqual(property.key, property.value.left);
		assert.strictEqual(property.key.parent, property);
		assert.strictEqual(property.value.left.parent, property.value);
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

describe('lazy AST node identity and shape', () => {
	it('spreads only the own AST fields of a node', () => {
		const ast = parseLazyAst('const x = foo;\nconst y = bar;');
		const identifier = ast.body[0].declarations[0].init;
		const declarator = ast.body[1].declarations[0];
		assert.deepStrictEqual({ ...identifier }, { end: 13, name: 'foo', start: 10 });
		assert.deepStrictEqual({ ...declarator }, { end: 28, start: 21 });
	});

	it('shares one prototype per node type across parses', () => {
		const firstIdentifier = parseLazyAst('foo;').body[0].expression;
		const secondIdentifier = parseLazyAst('bar;').body[0].expression;
		assert.notStrictEqual(firstIdentifier, secondIdentifier);
		assert.strictEqual(
			Object.getPrototypeOf(firstIdentifier),
			Object.getPrototypeOf(secondIdentifier)
		);
		assert.deepStrictEqual(Object.getOwnPropertyNames(firstIdentifier), ['start', 'end', 'name']);
	});
});
