const assert = require('node:assert/strict');

const templateLiterals = [];

module.exports = defineTest({
	description: 'parses a TemplateLiteral',
	options: {
		plugins: [
			{
				name: 'test-plugin',
				async transform(code) {
					await this.parseAndWalk(code, {
						TemplateLiteral(node) {
							templateLiterals.push(node);
						}
					});
					return null;
				}
			}
		]
	},
	exports() {
		assert.strictEqual(templateLiterals.length, 1);
		assert.strictEqual(templateLiterals[0].type, 'TemplateLiteral');
	}
});
