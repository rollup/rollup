const assert = require('node:assert/strict');

const unaryExpressions = [];

module.exports = defineTest({
	description: 'parses a UnaryExpression',
	walk: {
		UnaryExpression(node) {
			unaryExpressions.push(node);
		}
	},
	assertions() {
		assert.strictEqual(unaryExpressions.length, 1);
		assert.strictEqual(unaryExpressions[0].type, 'UnaryExpression');
	},
	expectedAst: {
		type: 'Program',
		start: 0,
		end: 22,
		body: [
			{
				type: 'ExportDefaultDeclaration',
				start: 0,
				end: 21,
				declaration: {
					type: 'UnaryExpression',
					start: 15,
					end: 20,
					operator: '!',
					argument: {
						type: 'Literal',
						start: 16,
						end: 20,
						value: true,
						raw: 'true'
					},
					prefix: true
				}
			}
		],
		sourceType: 'module'
	}
});
