const assert = require('node:assert/strict');

const identifiers = [];

module.exports = defineTest({
	description: 'parses an Identifier',
	walk: {
		Identifier(node) {
			identifiers.push(node);
		}
	},
	assertions() {
		assert.deepEqual(identifiers, [
			{
				type: 'Identifier',
				start: 6,
				end: 7,
				name: 'x'
			},
			{
				type: 'Identifier',
				start: 28,
				end: 29,
				name: 'x'
			}
		]);
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
