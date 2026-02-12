const assert = require('node:assert/strict');

const callExpressions = [];

module.exports = defineTest({
	description: 'parses a CallExpression',
	options: {
		plugins: [
			{
				name: 'test-plugin',
				async transform(code) {
					await this.parseAndWalk(code, {
						CallExpression(node) {
							callExpressions.push(node);
						}
					});
					return null;
				}
			}
		]
	},
	exports() {
		assert.deepEqual(callExpressions, [
			{
				type: 'CallExpression',
				start: 37,
				end: 43,
				optional: false,
				callee: {
					type: 'Identifier',
					start: 37,
					end: 40,
					name: 'foo'
				},
				arguments: [
					{
						type: 'Literal',
						start: 41,
						end: 42,
						raw: '1',
						value: 1
					}
				]
			}
		]);
	}
});
