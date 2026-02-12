const assert = require('node:assert/strict');

const indexSXSpreadAttributes = [];

module.exports = defineTest({
	description: 'parses a JSXSpreadAttribute',
	options: {
		plugins: [
			{
				name: 'test-plugin',
				async transform(code) {
					await this.parseAndWalk(
						code,
						{
							JSXSpreadAttribute(node) {
								indexSXSpreadAttributes.push(node);
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
		assert.strictEqual(indexSXSpreadAttributes.length, 1);
		assert.strictEqual(indexSXSpreadAttributes[0].type, 'JSXSpreadAttribute');
	}
});
