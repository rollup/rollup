const assert = require('node:assert/strict');

const importDefaultSpecifiers = [];

module.exports = defineTest({
	description: 'parses an ImportDefaultSpecifier',
	walk: {
		ImportDefaultSpecifier(node) {
			importDefaultSpecifiers.push(node);
		}
	},
	assertions() {
		assert.strictEqual(importDefaultSpecifiers.length, 1);
		assert.strictEqual(importDefaultSpecifiers[0].type, 'ImportDefaultSpecifier');
	}
});
