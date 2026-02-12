const assert = require('node:assert/strict');

const indexSXSpreadChilds = [];

module.exports = defineTest({
	description: 'parses a JSXSpreadChild',
	options: {
		plugins: [
			{
				name: 'test-plugin',
				async transform(code) {
					await this.parseAndWalk(
						code,
						{
							JSXSpreadChild(node) {
								indexSXSpreadChilds.push(node);
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
		assert.strictEqual(indexSXSpreadChilds.length, 1);
		assert.strictEqual(indexSXSpreadChilds[0].type, 'JSXSpreadChild');
	}
});
