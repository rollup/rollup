const assert = require('node:assert/strict');

const emptyStatements = [];

module.exports = defineTest({
	description: 'parses an EmptyStatement',
	walk: {
		EmptyStatement(node) {
			emptyStatements.push(node);
		}
	},
	assertions() {
		assert.deepEqual(emptyStatements, [
			{
				type: 'EmptyStatement',
				start: 0,
				end: 1
			}
		]);
	}
});
