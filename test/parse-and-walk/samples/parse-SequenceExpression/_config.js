const assert = require('node:assert/strict');

const sequenceExpressions = [];

module.exports = defineTest({
	description: 'parses a SequenceExpression',
	walk: {
		SequenceExpression(node) {
			sequenceExpressions.push(node);
		}
	},
	assertions() {
		assert.strictEqual(sequenceExpressions.length, 1);
		assert.strictEqual(sequenceExpressions[0].type, 'SequenceExpression');
	},
	expectedAst: {
		type: 'Program',
		start: 0,
		end: 23,
		body: [
			{
				type: 'ExportDefaultDeclaration',
				start: 0,
				end: 22,
				declaration: {
					type: 'SequenceExpression',
					start: 16,
					end: 20,
					expressions: [
						{
							type: 'Literal',
							start: 16,
							end: 17,
							raw: '1',
							value: 1
						},
						{
							type: 'Literal',
							start: 19,
							end: 20,
							raw: '2',
							value: 2
						}
					]
				}
			}
		],
		sourceType: 'module'
	}
});
