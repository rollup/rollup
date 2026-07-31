const assert = require('node:assert/strict');

const exportSpecifiers = [];

module.exports = defineTest({
	description: 'parses an ExportSpecifier',
	walk: {
		ExportSpecifier(node) {
			exportSpecifiers.push(node);
		}
	},
	assertions() {
		assert.deepEqual(exportSpecifiers, [
			{
				type: 'ExportSpecifier',
				start: 22,
				end: 23,
				local: {
					type: 'Identifier',
					start: 22,
					end: 23,
					name: 'x'
				},
				exported: {
					type: 'Identifier',
					start: 22,
					end: 23,
					name: 'x'
				}
			}
		]);
	},
	expectedAst: {
		type: 'Program',
		start: 0,
		end: 27,
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
				type: 'ExportNamedDeclaration',
				start: 13,
				end: 26,
				specifiers: [
					{
						type: 'ExportSpecifier',
						start: 22,
						end: 23,
						local: {
							type: 'Identifier',
							start: 22,
							end: 23,
							name: 'x'
						},
						exported: {
							type: 'Identifier',
							start: 22,
							end: 23,
							name: 'x'
						}
					}
				],
				source: null,
				attributes: [],
				declaration: null
			}
		],
		sourceType: 'module'
	}
});
