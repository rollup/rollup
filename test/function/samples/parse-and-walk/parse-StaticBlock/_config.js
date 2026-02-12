const assert = require('node:assert/strict');

const staticBlocks = [];

module.exports = defineTest({
	description: 'parses a StaticBlock',
	options: {
		plugins: [
			{
				name: 'test-plugin',
				async transform(code) {
					await this.parseAndWalk(code, {
						StaticBlock(node) {
							staticBlocks.push(node);
						}
					});
					return null;
				}
			}
		]
	},
	exports() {
		assert.strictEqual(staticBlocks.length, 1);
		assert.strictEqual(staticBlocks[0].type, 'StaticBlock');
	}
});
