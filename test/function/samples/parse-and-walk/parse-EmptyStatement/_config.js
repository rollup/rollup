const assert = require('node:assert/strict');

const emptyStatements = [];

module.exports = defineTest({
	description: 'parses an EmptyStatement',
	options: {
		plugins: [
			{
				name: 'test-plugin',
				async transform(code) {
					await this.parseAndWalk(code, {
						EmptyStatement(node) {
							emptyStatements.push(node);
						}
					});
					return null;
				}
			}
		]
	},
	exports() {
		assert.deepEqual(emptyStatements, [
			{
				type: 'EmptyStatement',
				start: 0,
				end: 1
			}
		]);
	}
});
