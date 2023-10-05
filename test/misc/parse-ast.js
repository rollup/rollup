const assert = require('node:assert');
const parseAstCjs = require('../../dist/parseAst');

describe('parseAst', () => {
	for (const { description, parsePromise } of [
		{ description: 'CommonJS', parsePromise: Promise.resolve(parseAstCjs) },
		// eslint-disable-next-line import/no-unresolved
		{ description: 'ESM', parsePromise: import('../../dist/es/parseAst.js') }
	]) {
		describe(description, () => {
			it('parses an AST', async () => {
				const { parseAst } = await parsePromise;
				const result = parseAst('console.log("ok")');
				assert.deepStrictEqual(result, {
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
				const { parseAst } = await parsePromise;
				assert.throws(() => parseAst('<=>'), {
					name: 'RollupError',
					message: 'Expression expected',
					code: 'PARSE_ERROR',
					pos: 0
				});
			});

			it('throws on return outside function by default', async () => {
				const { parseAst } = await parsePromise;
				assert.throws(() => parseAst('return 42;'), {
					name: 'RollupError',
					message: 'Return statement is not allowed here',
					code: 'PARSE_ERROR',
					pos: 0
				});
			});

			it('can handle return outside function if enabled', async () => {
				const { parseAst } = await parsePromise;
				const result = parseAst('return 42;', { allowReturnOutsideFunction: true });
				assert.deepStrictEqual(result, {
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
		});
	}
});
