const assert = require('node:assert/strict');

const importDefaultSpecifiers = [];

module.exports = defineTest({
	description: 'parses an ImportDefaultSpecifier',
	walk: {
		ImportDefaultSpecifier(node) {
			importDefaultSpecifiers.push(node);
		}
	},
	assertions() {
		assert.strictEqual(importDefaultSpecifiers.length, 1);
		assert.strictEqual(importDefaultSpecifiers[0].type, 'ImportDefaultSpecifier');
	},
	expectedAst: {
		type: 'Program',
		start: 0,
		end: 48,
		body: [
			{
				type: 'ImportDeclaration',
				start: 0,
				end: 27,
				specifiers: [
					{
						type: 'ImportDefaultSpecifier',
						start: 7,
						end: 10,
						local: {
							type: 'Identifier',
							start: 7,
							end: 10,
							name: 'foo'
						}
					}
				],
				source: {
					type: 'Literal',
					start: 16,
					end: 26,
					value: './dep.js',
					raw: "'./dep.js'"
				},
				attributes: []
			},
			{
				type: 'ExportDefaultDeclaration',
				start: 28,
				end: 47,
				declaration: {
					type: 'Identifier',
					start: 43,
					end: 46,
					name: 'foo'
				}
			}
		],
		sourceType: 'module'
	}
});
