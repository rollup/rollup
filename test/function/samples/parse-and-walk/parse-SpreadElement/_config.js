const assert = require('node:assert/strict');

const spreadElements = [];

module.exports = defineTest({
	description: 'parses a SpreadElement',
	options: {
		plugins: [
			{
				name: 'test-plugin',
				async transform(code) {
					await this.parseAndWalk(code, {
						SpreadElement(node) {
							spreadElements.push(node);
						}
					});
					return null;
				}
			}
		]
	},
	exports() {
		assert.strictEqual(spreadElements.length, 1);
		assert.strictEqual(spreadElements[0].type, 'SpreadElement');
	}
});
