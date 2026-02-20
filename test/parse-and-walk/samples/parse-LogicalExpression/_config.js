const assert = require('node:assert/strict');

const logicalExpressions = [];

module.exports = defineTest({
	description: 'parses a LogicalExpression',
	walk: {
		LogicalExpression(node) {
			logicalExpressions.push(node);
		}
	},
	assertions() {
		assert.deepEqual(logicalExpressions, [
			{
				type: 'LogicalExpression',
				start: 15,
				end: 28,
				operator: '&&',
				left: {
					type: 'Literal',
					start: 15,
					end: 19,
					value: true,
					raw: 'true'
				},
				right: {
					type: 'Literal',
					start: 23,
					end: 28,
					value: false,
					raw: 'false'
				}
			}
		]);
	},
	expectedAst: {
		type: 'Program',
		start: 0,
		end: 30,
		body: [
			{
				type: 'ExportDefaultDeclaration',
				start: 0,
				end: 29,
				declaration: {
					type: 'LogicalExpression',
					start: 15,
					end: 28,
					operator: '&&',
					left: {
						type: 'Literal',
						start: 15,
						end: 19,
						value: true,
						raw: 'true'
					},
					right: {
						type: 'Literal',
						start: 23,
						end: 28,
						value: false,
						raw: 'false'
					}
				}
			}
		],
		sourceType: 'module'
	}
});
