const assert = require('node:assert/strict');

const breakStatements = [];

module.exports = defineTest({
	description: 'parses a BreakStatement',
	walk: {
		BreakStatement(node) {
			breakStatements.push(node);
		}
	},
	assertions() {
		assert.strictEqual(breakStatements.length, 1);
		assert.strictEqual(breakStatements[0].type, 'BreakStatement');
	},
	expectedAst: {
		type: 'Program',
		start: 0,
		end: 55,
		body: [
			{
				type: 'ExportDefaultDeclaration',
				start: 0,
				end: 54,
				declaration: {
					type: 'FunctionDeclaration',
					start: 15,
					end: 54,
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
						end: 54,
						body: [
							{
								type: 'WhileStatement',
								start: 33,
								end: 52,
								test: {
									type: 'Literal',
									start: 40,
									end: 44,
									value: true,
									raw: 'true'
								},
								body: {
									type: 'BreakStatement',
									start: 46,
									end: 52,
									label: null
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
