const assert = require('node:assert/strict');

const variableDeclarations = [];

module.exports = defineTest({
	description: 'parses a VariableDeclaration',
	walk: {
		VariableDeclaration(node) {
			variableDeclarations.push(node);
		}
	},
	assertions() {
		assert.ok(variableDeclarations.length >= 1);
		assert.strictEqual(variableDeclarations[0].type, 'VariableDeclaration');
	},
	expectedAst: {
		type: 'Program',
		start: 0,
		end: 31,
		body: [
			{
				type: 'VariableDeclaration',
				start: 0,
				end: 12,
				kind: 'const',
				declarations: [
					{
						type: 'VariableDeclarator',
						start: 6,
						end: 11,
						id: {
							type: 'Identifier',
							start: 6,
							end: 7,
							name: 'x'
						},
						init: {
							type: 'Literal',
							start: 10,
							end: 11,
							raw: '1',
							value: 1
						}
					}
				]
			},
			{
				type: 'ExportDefaultDeclaration',
				start: 13,
				end: 30,
				declaration: {
					type: 'Identifier',
					start: 28,
					end: 29,
					name: 'x'
				}
			}
		],
		sourceType: 'module'
	}
});
