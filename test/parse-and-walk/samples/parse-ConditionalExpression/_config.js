const assert = require('node:assert/strict');

const conditionalExpressions = [];

module.exports = defineTest({
	description: 'parses a ConditionalExpression',
	walk: {
		ConditionalExpression(node) {
			conditionalExpressions.push(node);
		}
	},
	assertions() {
		assert.deepEqual(conditionalExpressions, [
			{
				type: 'ConditionalExpression',
				start: 15,
				end: 27,
				test: {
					type: 'Literal',
					start: 15,
					end: 19,
					value: true,
					raw: 'true'
				},
				consequent: {
					type: 'Literal',
					start: 22,
					end: 23,
					raw: '1',
					value: 1
				},
				alternate: {
					type: 'Literal',
					start: 26,
					end: 27,
					raw: '2',
					value: 2
				}
			}
		]);
	},
	expectedAst: {
		type: 'Program',
		start: 0,
		end: 29,
		body: [
			{
				type: 'ExportDefaultDeclaration',
				start: 0,
				end: 28,
				declaration: {
					type: 'ConditionalExpression',
					start: 15,
					end: 27,
					test: {
						type: 'Literal',
						start: 15,
						end: 19,
						value: true,
						raw: 'true'
					},
					consequent: {
						type: 'Literal',
						start: 22,
						end: 23,
						raw: '1',
						value: 1
					},
					alternate: {
						type: 'Literal',
						start: 26,
						end: 27,
						raw: '2',
						value: 2
					}
				}
			}
		],
		sourceType: 'module'
	}
});
