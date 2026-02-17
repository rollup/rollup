const assert = require('node:assert/strict');

const doWhileStatements = [];

module.exports = defineTest({
	description: 'parses a DoWhileStatement',
	walk: {
		DoWhileStatement(node) {
			doWhileStatements.push(node);
		}
	},
	assertions() {
		assert.deepEqual(doWhileStatements, [
			{
				type: 'DoWhileStatement',
				start: 11,
				end: 38,
				body: {
					type: 'BlockStatement',
					start: 14,
					end: 23,
					body: [
						{
							type: 'ExpressionStatement',
							start: 17,
							end: 21,
							expression: {
								type: 'UpdateExpression',
								start: 17,
								end: 20,
								prefix: false,
								operator: '++',
								argument: {
									type: 'Identifier',
									start: 17,
									end: 18,
									name: 'x'
								}
							}
						}
					]
				},
				test: {
					type: 'BinaryExpression',
					start: 31,
					end: 36,
					operator: '<',
					left: {
						type: 'Identifier',
						start: 31,
						end: 32,
						name: 'x'
					},
					right: {
						type: 'Literal',
						start: 35,
						end: 36,
						raw: '1',
						value: 1
					}
				}
			}
		]);
	}
});
