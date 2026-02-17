const assert = require('node:assert/strict');

const taggedTemplateExpressions = [];

module.exports = defineTest({
	description: 'parses a TaggedTemplateExpression',
	walk: {
		TaggedTemplateExpression(node) {
			taggedTemplateExpressions.push(node);
		}
	},
	assertions() {
		assert.strictEqual(taggedTemplateExpressions.length, 1);
		assert.strictEqual(taggedTemplateExpressions[0].type, 'TaggedTemplateExpression');
	}
});
