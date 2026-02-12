const assert = require('node:assert/strict');

const supers = [];

module.exports = defineTest({
	description: 'parses a Super',
	options: {
		plugins: [
			{
				name: 'test-plugin',
				async transform(code) {
					await this.parseAndWalk(code, {
						Super(node) {
							supers.push(node);
						}
					});
					return null;
				}
			}
		]
	},
	exports() {
		assert.strictEqual(supers.length, 1);
		assert.strictEqual(supers[0].type, 'Super');
	}
});
