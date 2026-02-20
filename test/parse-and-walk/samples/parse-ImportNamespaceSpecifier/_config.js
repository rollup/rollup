const assert = require('node:assert/strict');

const importNamespaceSpecifiers = [];

module.exports = defineTest({
	description: 'parses an ImportNamespaceSpecifier',
	walk: {
		ImportNamespaceSpecifier(node) {
			importNamespaceSpecifiers.push(node);
		}
	},
	assertions() {
		assert.deepEqual(importNamespaceSpecifiers, [
			{
				type: 'ImportNamespaceSpecifier',
				start: 7,
				end: 15,
				local: {
					type: 'Identifier',
					start: 12,
					end: 15,
					name: 'foo'
				}
			}
		]);
	},
	expectedAst: {
		type: 'Program',
		start: 0,
		end: 53,
		body: [
			{
				type: 'ImportDeclaration',
				start: 0,
				end: 32,
				specifiers: [
					{
						type: 'ImportNamespaceSpecifier',
						start: 7,
						end: 15,
						local: {
							type: 'Identifier',
							start: 12,
							end: 15,
							name: 'foo'
						}
					}
				],
				source: {
					type: 'Literal',
					start: 21,
					end: 31,
					value: './dep.js',
					raw: "'./dep.js'"
				},
				attributes: []
			},
			{
				type: 'ExportDefaultDeclaration',
				start: 33,
				end: 52,
				declaration: {
					type: 'Identifier',
					start: 48,
					end: 51,
					name: 'foo'
				}
			}
		],
		sourceType: 'module'
	}
});
