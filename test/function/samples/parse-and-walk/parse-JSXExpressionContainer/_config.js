const assert = require('node:assert/strict');

const indexSXExpressionContainers = [];

module.exports = defineTest({
	description: 'parses a JSXExpressionContainer',
	options: {
		plugins: [
			{
				name: 'test-plugin',
				async transform(code) {
					await this.parseAndWalk(
						code,
						{
							JSXExpressionContainer(node) {
								indexSXExpressionContainers.push(node);
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
		assert.strictEqual(indexSXExpressionContainers.length, 1);
		assert.strictEqual(indexSXExpressionContainers[0].type, 'JSXExpressionContainer');
	}
});
