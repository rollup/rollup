const assert = require('node:assert/strict');

const blockStatements = [];

module.exports = defineTest({
	description: 'parses a BlockStatement',
	options: {
		plugins: [
			{
				name: 'test-plugin',
				async transform(code) {
					await this.parseAndWalk(code, {
						BlockStatement(node) {
							blockStatements.push(node);
						}
					});
					return null;
				}
			}
		]
	},
	exports() {
		assert.deepEqual(blockStatements, [
			{
				type: 'BlockStatement',
				start: 30,
				end: 47,
				body: [
					{
						type: 'VariableDeclaration',
						start: 33,
						end: 45,
						kind: 'const',
						declarations: [
							{
								type: 'VariableDeclarator',
								start: 39,
								end: 44,
								id: {
									type: 'Identifier',
									start: 39,
									end: 40,
									name: 'x'
								},
								init: {
									type: 'Literal',
									start: 43,
									end: 44,
									raw: '1',
									value: 1
								}
							}
						]
					}
				]
			}
		]);
	}
});
