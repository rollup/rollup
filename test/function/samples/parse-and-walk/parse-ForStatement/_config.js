const assert = require('node:assert/strict');

const forStatements = [];

module.exports = defineTest({
	description: 'parses a ForStatement',
	options: {
		plugins: [
			{
				name: 'test-plugin',
				async transform(code) {
					await this.parseAndWalk(code, {
						ForStatement(node) {
							forStatements.push(node);
						}
					});
					return null;
				}
			}
		]
	},
	exports() {
		assert.deepEqual(forStatements, [
			{
				type: 'ForStatement',
				start: 0,
				end: 30,
				init: {
					type: 'VariableDeclaration',
					start: 5,
					end: 14,
					kind: 'let',
					declarations: [
						{
							type: 'VariableDeclarator',
							start: 9,
							end: 14,
							id: {
								type: 'Identifier',
								start: 9,
								end: 10,
								name: 'i'
							},
							init: {
								type: 'Literal',
								start: 13,
								end: 14,
								raw: '0',
								value: 0
							}
						}
					]
				},
				test: {
					type: 'BinaryExpression',
					start: 16,
					end: 21,
					operator: '<',
					left: {
						type: 'Identifier',
						start: 16,
						end: 17,
						name: 'i'
					},
					right: {
						type: 'Literal',
						start: 20,
						end: 21,
						raw: '1',
						value: 1
					}
				},
				update: {
					type: 'UpdateExpression',
					start: 23,
					end: 26,
					prefix: false,
					operator: '++',
					argument: {
						type: 'Identifier',
						start: 23,
						end: 24,
						name: 'i'
					}
				},
				body: {
					type: 'BlockStatement',
					start: 28,
					end: 30,
					body: []
				}
			}
		]);
	}
});
