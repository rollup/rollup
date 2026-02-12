const assert = require('node:assert/strict');

const templateElements = [];

module.exports = defineTest({
	description: 'parses a TemplateElement',
	options: {
		plugins: [
			{
				name: 'test-plugin',
				async transform(code) {
					await this.parseAndWalk(code, {
						TemplateElement(node) {
							templateElements.push(node);
						}
					});
					return null;
				}
			}
		]
	},
	exports() {
		assert.ok(templateElements.length >= 1);
		assert.strictEqual(templateElements[0].type, 'TemplateElement');
	}
});
