const assert = require('node:assert/strict');

const catchClauses = [];

module.exports = defineTest({
	description: 'parses a CatchClause',
	options: {
		plugins: [
			{
				name: 'test-plugin',
				async transform(code) {
					await this.parseAndWalk(code, {
						CatchClause(node) {
							catchClauses.push(node);
						}
					});
					return null;
				}
			}
		]
	},
	exports() {
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
