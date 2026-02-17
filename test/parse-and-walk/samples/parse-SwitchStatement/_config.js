const assert = require('node:assert/strict');

const switchStatements = [];

module.exports = defineTest({
	description: 'parses a SwitchStatement',
	walk: {
		SwitchStatement(node) {
			switchStatements.push(node);
		}
	},
	assertions() {
		assert.strictEqual(switchStatements.length, 1);
		assert.strictEqual(switchStatements[0].type, 'SwitchStatement');
	}
});
