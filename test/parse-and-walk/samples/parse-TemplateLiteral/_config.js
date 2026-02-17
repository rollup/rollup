const assert = require('node:assert/strict');

const templateLiterals = [];

module.exports = defineTest({
	description: 'parses a TemplateLiteral',
	walk: {
		TemplateLiteral(node) {
			templateLiterals.push(node);
		}
	},
	assertions() {
		assert.strictEqual(templateLiterals.length, 1);
		assert.strictEqual(templateLiterals[0].type, 'TemplateLiteral');
	}
});
