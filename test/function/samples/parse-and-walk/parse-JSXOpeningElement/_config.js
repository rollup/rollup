const assert = require('node:assert/strict');

const indexSXOpeningElements = [];

module.exports = defineTest({
	description: 'parses a JSXOpeningElement',
	options: {
		plugins: [
			{
				name: 'test-plugin',
				async transform(code) {
					await this.parseAndWalk(
						code,
						{
							JSXOpeningElement(node) {
								indexSXOpeningElements.push(node);
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
		assert.strictEqual(indexSXOpeningElements.length, 1);
		assert.strictEqual(indexSXOpeningElements[0].type, 'JSXOpeningElement');
	}
});
