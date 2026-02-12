const assert = require('node:assert/strict');

const indexSXClosingElements = [];

module.exports = defineTest({
	description: 'parses a JSXClosingElement',
	options: {
		plugins: [
			{
				name: 'test-plugin',
				async transform(code) {
					await this.parseAndWalk(
						code,
						{
							JSXClosingElement(node) {
								indexSXClosingElements.push(node);
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
		assert.strictEqual(indexSXClosingElements.length, 1);
		assert.strictEqual(indexSXClosingElements[0].type, 'JSXClosingElement');
	}
});
