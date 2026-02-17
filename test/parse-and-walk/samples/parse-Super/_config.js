const assert = require('node:assert/strict');

const supers = [];

module.exports = defineTest({
	description: 'parses a Super',
	walk: {
		Super(node) {
			supers.push(node);
		}
	},
	assertions() {
		assert.strictEqual(supers.length, 1);
		assert.strictEqual(supers[0].type, 'Super');
	}
});
