const assert = require('node:assert/strict');

const indexSXMemberExpressions = [];

module.exports = defineTest({
	description: 'parses a JSXMemberExpression',
	options: {
		plugins: [
			{
				name: 'test-plugin',
				async transform(code) {
					await this.parseAndWalk(
						code,
						{
							JSXMemberExpression(node) {
								indexSXMemberExpressions.push(node);
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
		assert.ok(indexSXMemberExpressions.length >= 2);
		assert.strictEqual(indexSXMemberExpressions[0].type, 'JSXMemberExpression');
	}
});
