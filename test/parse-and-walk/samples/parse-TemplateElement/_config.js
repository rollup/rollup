const assert = require('node:assert/strict');

const templateElements = [];

module.exports = defineTest({
	description: 'parses a TemplateElement',
	walk: {
		TemplateElement(node) {
			templateElements.push(node);
		}
	},
	assertions() {
		assert.ok(templateElements.length >= 1);
		assert.strictEqual(templateElements[0].type, 'TemplateElement');
	}
});
