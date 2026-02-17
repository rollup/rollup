const assert = require('node:assert/strict');

const throwStatements = [];

module.exports = defineTest({
	description: 'parses a ThrowStatement',
	walk: {
		ThrowStatement(node) {
			throwStatements.push(node);
		}
	},
	assertions() {
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
