const assert = require('node:assert/strict');

const updateExpressions = [];

module.exports = defineTest({
	description: 'parses an UpdateExpression',
	walk: {
		UpdateExpression(node) {
			updateExpressions.push(node);
		}
	},
	assertions() {
		assert.strictEqual(updateExpressions.length, 1);
		assert.strictEqual(updateExpressions[0].type, 'UpdateExpression');
	},
	expectedAst: {
		type: 'Program',
		start: 0,
		end: 31,
		body: [
			{
				type: 'VariableDeclaration',
				start: 0,
				end: 10,
				kind: 'let',
				declarations: [
					{
						type: 'VariableDeclarator',
						start: 4,
						end: 9,
						id: {
							type: 'Identifier',
							start: 4,
							end: 5,
							name: 'x'
						},
						init: {
							type: 'Literal',
							start: 8,
							end: 9,
							raw: '0',
							value: 0
						}
					}
				]
			},
			{
				type: 'ExportDefaultDeclaration',
				start: 11,
				end: 30,
				declaration: {
					type: 'UpdateExpression',
					start: 26,
					end: 29,
					prefix: true,
					operator: '++',
					argument: {
						type: 'Identifier',
						start: 28,
						end: 29,
						name: 'x'
					}
				}
			}
		],
		sourceType: 'module'
	}
});
