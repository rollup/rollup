const assert = require('node:assert/strict');

const importSpecifiers = [];

module.exports = defineTest({
	description: 'parses an ImportSpecifier',
	options: {
		plugins: [
			{
				name: 'test-plugin',
				async transform(code) {
					await this.parseAndWalk(code, {
						ImportSpecifier(node) {
							importSpecifiers.push(node);
						}
					});
					return null;
				}
			}
		]
	},
	exports() {
		assert.deepEqual(importSpecifiers, [
			{
				type: 'ImportSpecifier',
				start: 9,
				end: 12,
				imported: {
					type: 'Identifier',
					start: 9,
					end: 12,
					name: 'foo'
				},
				local: {
					type: 'Identifier',
					start: 9,
					end: 12,
					name: 'foo'
				}
			}
		]);
	}
});
