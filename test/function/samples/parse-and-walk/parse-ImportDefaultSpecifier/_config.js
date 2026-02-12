const assert = require('node:assert/strict');

const importDefaultSpecifiers = [];

module.exports = defineTest({
	description: 'parses an ImportDefaultSpecifier',
	options: {
		plugins: [
			{
				name: 'test-plugin',
				async transform(code) {
					await this.parseAndWalk(code, {
						ImportDefaultSpecifier(node) {
							importDefaultSpecifiers.push(node);
						}
					});
					return null;
				}
			}
		]
	},
	exports() {
		assert.strictEqual(importDefaultSpecifiers.length, 1);
		assert.strictEqual(importDefaultSpecifiers[0].type, 'ImportDefaultSpecifier');
	}
});
