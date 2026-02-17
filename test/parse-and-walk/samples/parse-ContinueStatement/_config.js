const assert = require('node:assert/strict');

const continueStatements = [];

module.exports = defineTest({
	description: 'parses a ContinueStatement',
	walk: {
		ContinueStatement(node) {
			continueStatements.push(node);
		}
	},
	assertions() {
		assert.deepEqual(continueStatements, [
			{
				type: 'ContinueStatement',
				start: 32,
				end: 41,
				label: null
			}
		]);
	}
});
