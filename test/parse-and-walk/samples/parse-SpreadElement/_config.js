const assert = require('node:assert/strict');

const spreadElements = [];

module.exports = defineTest({
	description: 'parses a SpreadElement',
	walk: {
		SpreadElement(node) {
			spreadElements.push(node);
		}
	},
	assertions() {
		assert.strictEqual(spreadElements.length, 1);
		assert.strictEqual(spreadElements[0].type, 'SpreadElement');
	}
});
