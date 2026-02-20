const assert = require('node:assert/strict');

const functionDeclarations = [];

module.exports = defineTest({
	description: 'parses a FunctionDeclaration',
	walk: {
		FunctionDeclaration(node) {
			functionDeclarations.push(node);
		}
	},
	assertions() {
		assert.deepEqual(functionDeclarations, [
			{
				type: 'FunctionDeclaration',
				start: 0,
				end: 17,
				async: false,
				generator: false,
				id: {
					type: 'Identifier',
					start: 9,
					end: 12,
					name: 'foo'
				},
				params: [],
				body: {
					type: 'BlockStatement',
					start: 15,
					end: 17,
					body: []
				},
				expression: false
			}
		]);
	},
	expectedAst: {
		type: 'Program',
		start: 0,
		end: 38,
		body: [
			{
				type: 'FunctionDeclaration',
				start: 0,
				end: 17,
				async: false,
				generator: false,
				id: {
					type: 'Identifier',
					start: 9,
					end: 12,
					name: 'foo'
				},
				params: [],
				body: {
					type: 'BlockStatement',
					start: 15,
					end: 17,
					body: []
				},
				expression: false
			},
			{
				type: 'ExportDefaultDeclaration',
				start: 18,
				end: 37,
				declaration: {
					type: 'Identifier',
					start: 33,
					end: 36,
					name: 'foo'
				}
			}
		],
		sourceType: 'module'
	}
});
