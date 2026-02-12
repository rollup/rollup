const assert = require('node:assert/strict');

const breakStatements = [];

module.exports = defineTest({
	description: 'parses a BreakStatement',
	options: {
		plugins: [
			{
				name: 'test-plugin',
				async transform(code) {
					await this.parseAndWalk(code, {
						BreakStatement(node) {
							breakStatements.push(node);
						}
					});
					return null;
				}
			}
		]
	},
	exports() {
		assert.strictEqual(breakStatements.length, 1);
		assert.strictEqual(breakStatements[0].type, 'BreakStatement');
	}
});
