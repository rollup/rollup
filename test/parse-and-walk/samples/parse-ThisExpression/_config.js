const assert = require('node:assert/strict');

const thisExpressions = [];

module.exports = defineTest({
	description: 'parses a ThisExpression',
	walk: {
		ThisExpression(node) {
			thisExpressions.push(node);
		}
	},
	assertions() {
		assert.strictEqual(thisExpressions.length, 1);
		assert.strictEqual(thisExpressions[0].type, 'ThisExpression');
	},
	expectedAst: {
		type: 'Program',
		start: 0,
		end: 55,
		body: [
			{
				type: 'ExportDefaultDeclaration',
				start: 0,
				end: 54,
				declaration: {
					type: 'FunctionDeclaration',
					start: 15,
					end: 54,
					async: false,
					generator: false,
					id: {
						type: 'Identifier',
						start: 24,
						end: 28,
						name: 'test'
					},
					params: [],
					body: {
						type: 'BlockStatement',
						start: 31,
						end: 54,
						body: [
							{
								type: 'ReturnStatement',
								start: 34,
								end: 52,
								argument: {
									type: 'MemberExpression',
									start: 41,
									end: 51,
									computed: false,
									optional: false,
									object: {
										type: 'ThisExpression',
										start: 41,
										end: 45
									},
									property: {
										type: 'Identifier',
										start: 46,
										end: 51,
										name: 'value'
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
