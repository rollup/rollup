const assert = require('node:assert/strict');

const classExpressions = [];

module.exports = defineTest({
	description: 'parses a ClassExpression',
	walk: {
		ClassExpression(node) {
			classExpressions.push(node);
		}
	},
	assertions() {
		assert.deepEqual(classExpressions, [
			{
				type: 'ClassExpression',
				start: 16,
				end: 24,
				decorators: [],
				id: null,
				superClass: null,
				body: {
					type: 'ClassBody',
					start: 22,
					end: 24,
					body: []
				}
			}
		]);
	},
	expectedAst: {
		type: 'Program',
		start: 0,
		end: 27,
		body: [
			{
				type: 'ExportDefaultDeclaration',
				start: 0,
				end: 26,
				declaration: {
					type: 'ClassExpression',
					start: 16,
					end: 24,
					decorators: [],
					id: null,
					superClass: null,
					body: {
						type: 'ClassBody',
						start: 22,
						end: 24,
						body: []
					}
				}
			}
		],
		sourceType: 'module'
	}
});
