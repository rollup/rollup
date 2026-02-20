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
	},
	expectedAst: {
		type: 'Program',
		start: 0,
		end: 61,
		body: [
			{
				type: 'ExportDefaultDeclaration',
				start: 0,
				end: 60,
				declaration: {
					type: 'FunctionDeclaration',
					start: 15,
					end: 60,
					async: false,
					generator: false,
					id: {
						type: 'Identifier',
						start: 24,
						end: 28,
						name: 'test'
					},
					params: [],
					body: {
						type: 'BlockStatement',
						start: 31,
						end: 60,
						body: [
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
						]
					},
					expression: false
				}
			}
		],
		sourceType: 'module'
	}
});
