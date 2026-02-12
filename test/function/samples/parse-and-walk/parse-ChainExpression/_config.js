const assert = require('node:assert/strict');

const chainExpressions = [];

module.exports = defineTest({
	description: 'parses a ChainExpression',
	options: {
		plugins: [
			{
				name: 'test-plugin',
				async transform(code) {
					await this.parseAndWalk(code, {
						ChainExpression(node) {
							chainExpressions.push(node);
						}
					});
					return null;
				}
			}
		]
	},
	exports() {
		assert.deepEqual(chainExpressions, [
			{
				type: 'ChainExpression',
				start: 31,
				end: 40,
				expression: {
					type: 'MemberExpression',
					start: 31,
					end: 40,
					computed: false,
					optional: true,
					object: {
						type: 'Identifier',
						start: 31,
						end: 34,
						name: 'obj'
					},
					property: {
						type: 'Identifier',
						start: 36,
						end: 40,
						name: 'prop'
					}
				}
			}
		]);
	}
});
