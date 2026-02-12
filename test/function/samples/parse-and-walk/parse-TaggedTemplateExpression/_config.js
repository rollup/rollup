const assert = require('node:assert/strict');

const taggedTemplateExpressions = [];

module.exports = defineTest({
	description: 'parses a TaggedTemplateExpression',
	options: {
		plugins: [
			{
				name: 'test-plugin',
				async transform(code) {
					await this.parseAndWalk(code, {
						TaggedTemplateExpression(node) {
							taggedTemplateExpressions.push(node);
						}
					});
					return null;
				}
			}
		]
	},
	exports() {
		assert.strictEqual(taggedTemplateExpressions.length, 1);
		assert.strictEqual(taggedTemplateExpressions[0].type, 'TaggedTemplateExpression');
	}
});
