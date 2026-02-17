const assert = require('node:assert/strict');

const staticBlocks = [];

module.exports = defineTest({
	description: 'parses a StaticBlock',
	walk: {
		StaticBlock(node) {
			staticBlocks.push(node);
		}
	},
	assertions() {
		assert.strictEqual(staticBlocks.length, 1);
		assert.strictEqual(staticBlocks[0].type, 'StaticBlock');
	}
});
