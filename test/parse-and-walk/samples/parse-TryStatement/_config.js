const assert = require('node:assert/strict');

const tryStatements = [];

module.exports = defineTest({
	description: 'parses a TryStatement',
	walk: {
		TryStatement(node) {
			tryStatements.push(node);
		}
	},
	assertions() {
		assert.strictEqual(tryStatements.length, 1);
		assert.strictEqual(tryStatements[0].type, 'TryStatement');
	},
	expectedAst: {
		type: 'Program',
		start: 0,
		end: 70,
		body: [
			{
				type: 'ExportDefaultDeclaration',
				start: 0,
				end: 69,
				declaration: {
					type: 'FunctionDeclaration',
					start: 15,
					end: 69,
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
						end: 69,
						body: [
							{
								type: 'TryStatement',
								start: 34,
								end: 67,
								block: {
									type: 'BlockStatement',
									start: 38,
									end: 54,
									body: [
										{
											type: 'ReturnStatement',
											start: 42,
											end: 51,
											argument: {
												type: 'Literal',
												start: 49,
												end: 50,
												raw: '1',
												value: 1
											}
										}
									]
								},
								handler: {
									type: 'CatchClause',
									start: 55,
									end: 67,
									param: {
										type: 'Identifier',
										start: 62,
										end: 63,
										name: 'e'
									},
									body: {
										type: 'BlockStatement',
										start: 65,
										end: 67,
										body: []
									}
								},
								finalizer: null
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
