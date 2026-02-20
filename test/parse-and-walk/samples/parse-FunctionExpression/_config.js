const assert = require('node:assert/strict');

const functionExpressions = [];

module.exports = defineTest({
	description: 'parses a FunctionExpression',
	walk: {
		FunctionExpression(node) {
			functionExpressions.push(node);
		}
	},
	assertions() {
		assert.deepEqual(functionExpressions, [
			{
				type: 'FunctionExpression',
				start: 16,
				end: 30,
				async: false,
				generator: false,
				id: null,
				params: [],
				body: {
					type: 'BlockStatement',
					start: 28,
					end: 30,
					body: []
				},
				expression: false
			}
		]);
	},
	expectedAst: {
		type: 'Program',
		start: 0,
		end: 33,
		body: [
			{
				type: 'ExportDefaultDeclaration',
				start: 0,
				end: 32,
				declaration: {
					type: 'FunctionExpression',
					start: 16,
					end: 30,
					async: false,
					generator: false,
					id: null,
					params: [],
					body: {
						type: 'BlockStatement',
						start: 28,
						end: 30,
						body: []
					},
					expression: false
				}
			}
		],
		sourceType: 'module'
	}
});
