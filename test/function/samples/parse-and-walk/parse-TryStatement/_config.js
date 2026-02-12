const assert = require('node:assert/strict');

const tryStatements = [];

module.exports = defineTest({
	description: 'parses a TryStatement',
	options: {
		plugins: [
			{
				name: 'test-plugin',
				async transform(code) {
					await this.parseAndWalk(code, {
						TryStatement(node) {
							tryStatements.push(node);
						}
					});
					return null;
				}
			}
		]
	},
	exports() {
		assert.strictEqual(tryStatements.length, 1);
		assert.strictEqual(tryStatements[0].type, 'TryStatement');
	}
});
