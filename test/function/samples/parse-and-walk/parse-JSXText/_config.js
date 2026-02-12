const assert = require('node:assert/strict');

const indexSXTexts = [];

module.exports = defineTest({
	description: 'parses a JSXText',
	options: {
		plugins: [
			{
				name: 'test-plugin',
				async transform(code) {
					await this.parseAndWalk(
						code,
						{
							JSXText(node) {
								indexSXTexts.push(node);
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
		assert.strictEqual(indexSXTexts.length, 1);
		assert.strictEqual(indexSXTexts[0].type, 'JSXText');
	}
});
