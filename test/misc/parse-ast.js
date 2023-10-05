const assert = require('node:assert');
const { parseAst } = require('../../dist/parseAst');

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

	it('works as an ES module', async () => {
		// eslint-disable-next-line import/no-unresolved
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

	it('throws on parse errors', async () => {
		assert.throws(() => parseAst('<=>'), {
			name: 'RollupError',
			message: 'Expression expected',
			code: 'PARSE_ERROR',
			pos: 0
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

	it('uses different references for key and value of a shorthand property', async () => {
		const { key, value } = parseAst('({ foo });').body[0].expression.properties[0];
		assert.deepStrictEqual(key, value);
		assert.ok(key !== value);
	});
});
