const assert = require('node:assert/strict');

const returnStatements = [];

module.exports = defineTest({
	description: 'parses a ReturnStatement',
	walk: {
		ReturnStatement(node) {
			returnStatements.push(node);
		}
	},
	assertions() {
		assert.strictEqual(returnStatements.length, 1);
		assert.strictEqual(returnStatements[0].type, 'ReturnStatement');
	},
	expectedAst: {
		type: 'Program',
		start: 0,
		end: 40,
		body: [
			{
				type: 'ExportDefaultDeclaration',
				start: 0,
				end: 39,
				declaration: {
					type: 'FunctionDeclaration',
					start: 15,
					end: 39,
					async: false,
					generator: false,
					id: null,
					params: [],
					body: {
						type: 'BlockStatement',
						start: 26,
						end: 39,
						body: [
							{
								type: 'ReturnStatement',
								start: 28,
								end: 37,
								argument: {
									type: 'Literal',
									start: 35,
									end: 36,
									raw: '1',
									value: 1
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
