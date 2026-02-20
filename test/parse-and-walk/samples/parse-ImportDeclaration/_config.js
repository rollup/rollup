const assert = require('node:assert/strict');

const importDeclarations = [];

module.exports = defineTest({
	description: 'parses an ImportDeclaration',
	walk: {
		ImportDeclaration(node) {
			importDeclarations.push(node);
		}
	},
	assertions() {
		assert.strictEqual(importDeclarations.length, 1);
		assert.strictEqual(importDeclarations[0].type, 'ImportDeclaration');
	},
	expectedAst: {
		type: 'Program',
		start: 0,
		end: 52,
		body: [
			{
				type: 'ImportDeclaration',
				start: 0,
				end: 31,
				specifiers: [
					{
						type: 'ImportSpecifier',
						start: 9,
						end: 12,
						imported: {
							type: 'Identifier',
							start: 9,
							end: 12,
							name: 'foo'
						},
						local: {
							type: 'Identifier',
							start: 9,
							end: 12,
							name: 'foo'
						}
					}
				],
				source: {
					type: 'Literal',
					start: 20,
					end: 30,
					value: './dep.js',
					raw: "'./dep.js'"
				},
				attributes: []
			},
			{
				type: 'ExportDefaultDeclaration',
				start: 32,
				end: 51,
				declaration: {
					type: 'Identifier',
					start: 47,
					end: 50,
					name: 'foo'
				}
			}
		],
		sourceType: 'module'
	}
});
