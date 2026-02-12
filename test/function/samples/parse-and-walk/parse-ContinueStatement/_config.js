const assert = require('node:assert/strict');

const continueStatements = [];

module.exports = defineTest({
	description: 'parses a ContinueStatement',
	options: {
		plugins: [
			{
				name: 'test-plugin',
				async transform(code) {
					await this.parseAndWalk(code, {
						ContinueStatement(node) {
							continueStatements.push(node);
						}
					});
					return null;
				}
			}
		]
	},
	exports() {
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
