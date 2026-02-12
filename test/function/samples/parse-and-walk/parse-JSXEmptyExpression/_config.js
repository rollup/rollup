const assert = require('node:assert/strict');

const indexSXEmptyExpressions = [];

module.exports = defineTest({
	description: 'parses a JSXEmptyExpression',
	options: {
		plugins: [
			{
				name: 'test-plugin',
				async transform(code) {
					await this.parseAndWalk(
						code,
						{
							JSXEmptyExpression(node) {
								indexSXEmptyExpressions.push(node);
							}
						},
						{ jsx: true }
					);
					return 'export default null;';
				}
			}
		]
	},
	exports() {
		assert.strictEqual(indexSXEmptyExpressions.length, 1);
		assert.strictEqual(indexSXEmptyExpressions[0].type, 'JSXEmptyExpression');
	}
});
