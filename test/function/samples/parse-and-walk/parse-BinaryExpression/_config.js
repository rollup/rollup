const assert = require('node:assert/strict');

const binaryExpressions = [];

module.exports = defineTest({
	description: 'parses a BinaryExpression',
	options: {
		plugins: [
			{
				name: 'test-plugin',
				async transform(code) {
					await this.parseAndWalk(code, {
						BinaryExpression(node) {
							binaryExpressions.push(node);
						}
					});
					return null;
				}
			}
		]
	},
	exports() {
		assert.deepEqual(binaryExpressions, [
			{
				type: 'BinaryExpression',
				start: 15,
				end: 20,
				operator: '+',
				left: {
					type: 'Literal',
					start: 15,
					end: 16,
					raw: '1',
					value: 1
				},
				right: {
					type: 'Literal',
					start: 19,
					end: 20,
					raw: '2',
					value: 2
				}
			}
		]);
	}
});
