const assert = require('node:assert/strict');

const importExpressions = [];

module.exports = defineTest({
	description: 'parses an ImportExpression',
	options: {
		plugins: [
			{
				name: 'test-plugin',
				async transform(code) {
					await this.parseAndWalk(code, {
						ImportExpression(node) {
							importExpressions.push(node);
						}
					});
					return null;
				}
			}
		]
	},
	exports() {
		assert.deepEqual(importExpressions, [
			{
				type: 'ImportExpression',
				start: 15,
				end: 33,
				source: {
					type: 'Literal',
					start: 22,
					end: 32,
					value: './dep.js',
					raw: "'./dep.js'"
				},
				options: null
			}
		]);
	}
});
