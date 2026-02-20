const assert = require('node:assert/strict');

const catchClauses = [];

module.exports = defineTest({
	description: 'parses a CatchClause',
	walk: {
		CatchClause(node) {
			catchClauses.push(node);
		}
	},
	assertions() {
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
	},
	expectedAst: {
		type: 'Program',
		start: 0,
		end: 57,
		body: [
			{
				type: 'ExportDefaultDeclaration',
				start: 0,
				end: 56,
				declaration: {
					type: 'FunctionDeclaration',
					start: 15,
					end: 56,
					async: false,
					generator: false,
					id: {
						type: 'Identifier',
						start: 24,
						end: 27,
						name: 'foo'
					},
					params: [],
					body: {
						type: 'BlockStatement',
						start: 30,
						end: 56,
						body: [
							{
								type: 'TryStatement',
								start: 33,
								end: 54,
								block: {
									type: 'BlockStatement',
									start: 37,
									end: 41,
									body: []
								},
								handler: {
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
