const assert = require('node:assert/strict');

const importNamespaceSpecifiers = [];

module.exports = defineTest({
	description: 'parses an ImportNamespaceSpecifier',
	walk: {
		ImportNamespaceSpecifier(node) {
			importNamespaceSpecifiers.push(node);
		}
	},
	assertions() {
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
