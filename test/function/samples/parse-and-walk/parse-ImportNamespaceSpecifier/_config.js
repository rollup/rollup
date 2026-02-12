const assert = require('node:assert/strict');

const importNamespaceSpecifiers = [];

module.exports = defineTest({
	description: 'parses an ImportNamespaceSpecifier',
	options: {
		plugins: [
			{
				name: 'test-plugin',
				async transform(code) {
					await this.parseAndWalk(code, {
						ImportNamespaceSpecifier(node) {
							importNamespaceSpecifiers.push(node);
						}
					});
					return null;
				}
			}
		]
	},
	exports() {
		assert.deepEqual(importNamespaceSpecifiers, [
			{
				type: 'ImportNamespaceSpecifier',
				start: 7,
				end: 15,
				local: {
					type: 'Identifier',
					start: 12,
					end: 15,
					name: 'foo'
				}
			}
		]);
	}
});
