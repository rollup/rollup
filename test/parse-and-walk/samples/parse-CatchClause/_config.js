const assert = require('node:assert/strict');

const catchClauses = [];

module.exports = defineTest({
	description: 'parses a CatchClause',
	walk: {
		CatchClause(node) {
			catchClauses.push(node);
		}
	},
	assertions() {
		assert.deepEqual(catchClauses, [
			{
				type: 'CatchClause',
				start: 42,
				end: 54,
				param: {
					type: 'Identifier',
					start: 49,
					end: 50,
					name: 'e'
				},
				body: {
					type: 'BlockStatement',
					start: 52,
					end: 54,
					body: []
				}
			}
		]);
	}
});
