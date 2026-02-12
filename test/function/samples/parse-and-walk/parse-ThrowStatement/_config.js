const assert = require('node:assert/strict');

const throwStatements = [];

module.exports = defineTest({
	description: 'parses a ThrowStatement',
	options: {
		plugins: [
			{
				name: 'test-plugin',
				async transform(code) {
					await this.parseAndWalk(code, {
						ThrowStatement(node) {
							throwStatements.push(node);
						}
					});
					return null;
				}
			}
		]
	},
	exports() {
		assert.deepEqual(throwStatements, [
			{
				type: 'ThrowStatement',
				start: 34,
				end: 58,
				argument: {
					type: 'NewExpression',
					start: 40,
					end: 57,
					callee: {
						type: 'Identifier',
						start: 44,
						end: 49,
						name: 'Error'
					},
					arguments: [
						{
							type: 'Literal',
							start: 50,
							end: 56,
							value: 'test',
							raw: "'test'"
						}
					]
				}
			}
		]);
	}
});
