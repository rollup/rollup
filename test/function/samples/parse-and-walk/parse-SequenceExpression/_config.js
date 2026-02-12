const assert = require('node:assert/strict');

const sequenceExpressions = [];

module.exports = defineTest({
	description: 'parses a SequenceExpression',
	options: {
		plugins: [
			{
				name: 'test-plugin',
				async transform(code) {
					await this.parseAndWalk(code, {
						SequenceExpression(node) {
							sequenceExpressions.push(node);
						}
					});
					return null;
				}
			}
		]
	},
	exports() {
		assert.strictEqual(sequenceExpressions.length, 1);
		assert.strictEqual(sequenceExpressions[0].type, 'SequenceExpression');
	}
});
