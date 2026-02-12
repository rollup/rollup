const assert = require('node:assert/strict');

const classExpressions = [];

module.exports = defineTest({
	description: 'parses a ClassExpression',
	options: {
		plugins: [
			{
				name: 'test-plugin',
				async transform(code) {
					await this.parseAndWalk(code, {
						ClassExpression(node) {
							classExpressions.push(node);
						}
					});
					return null;
				}
			}
		]
	},
	exports() {
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
	}
});
