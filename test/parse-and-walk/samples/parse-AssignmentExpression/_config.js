const assert = require('node:assert/strict');

const assignmentExpressions = [];

module.exports = defineTest({
	description: 'parses an AssignmentExpression',
	walk: {
		AssignmentExpression(node) {
			assignmentExpressions.push(node);
		}
	},
	assertions() {
		assert.deepEqual(assignmentExpressions, [
			{
				type: 'AssignmentExpression',
				start: 22,
				end: 27,
				operator: '=',
				left: { type: 'Identifier', start: 22, end: 23, name: 'x' },
				right: { type: 'Literal', start: 26, end: 27, raw: '1', value: 1 }
			}
		]);
	},
	expectedAst: {
		type: 'Program',
		start: 0,
		end: 29,
		body: [
			{
				type: 'VariableDeclaration',
				start: 0,
				end: 6,
				kind: 'let',
				declarations: [
					{
						type: 'VariableDeclarator',
						start: 4,
						end: 5,
						id: {
							type: 'Identifier',
							start: 4,
							end: 5,
							name: 'x'
						},
						init: null
					}
				]
			},
			{
				type: 'ExportDefaultDeclaration',
				start: 7,
				end: 28,
				declaration: {
					type: 'AssignmentExpression',
					start: 22,
					end: 27,
					operator: '=',
					left: {
						type: 'Identifier',
						start: 22,
						end: 23,
						name: 'x'
					},
					right: {
						type: 'Literal',
						start: 26,
						end: 27,
						raw: '1',
						value: 1
					}
				}
			}
		],
		sourceType: 'module'
	}
});
