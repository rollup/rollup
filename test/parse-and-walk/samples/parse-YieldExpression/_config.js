const assert = require('node:assert/strict');

const yieldExpressions = [];

module.exports = defineTest({
	description: 'parses a YieldExpression',
	walk: {
		YieldExpression(node) {
			yieldExpressions.push(node);
		}
	},
	assertions() {
		assert.strictEqual(yieldExpressions.length, 1);
		assert.strictEqual(yieldExpressions[0].type, 'YieldExpression');
	},
	expectedAst: {
		type: 'Program',
		start: 0,
		end: 45,
		body: [
			{
				type: 'ExportDefaultDeclaration',
				start: 0,
				end: 44,
				declaration: {
					type: 'FunctionDeclaration',
					start: 15,
					end: 44,
					async: false,
					generator: true,
					id: {
						type: 'Identifier',
						start: 25,
						end: 28,
						name: 'gen'
					},
					params: [],
					body: {
						type: 'BlockStatement',
						start: 31,
						end: 44,
						body: [
							{
								type: 'ExpressionStatement',
								start: 34,
								end: 42,
								expression: {
									type: 'YieldExpression',
									start: 34,
									end: 41,
									delegate: false,
									argument: {
										type: 'Literal',
										start: 40,
										end: 41,
										raw: '1',
										value: 1
									}
								}
							}
						]
					},
					expression: false
				}
			}
		],
		sourceType: 'module'
	}
});
