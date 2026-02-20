const assert = require('node:assert/strict');

const importAttributes = [];

module.exports = defineTest({
	description: 'parses an ImportAttribute',
	walk: {
		ImportAttribute(node) {
			importAttributes.push(node);
		}
	},
	assertions() {
		assert.deepEqual(importAttributes, [
			{
				type: 'ImportAttribute',
				start: 36,
				end: 48,
				key: {
					type: 'Identifier',
					start: 36,
					end: 40,
					name: 'type'
				},
				value: {
					type: 'Literal',
					start: 42,
					end: 48,
					value: 'json',
					raw: "'json'"
				}
			}
		]);
	},
	expectedAst: {
		type: 'Program',
		start: 0,
		end: 73,
		body: [
			{
				type: 'ImportDeclaration',
				start: 0,
				end: 51,
				specifiers: [
					{
						type: 'ImportDefaultSpecifier',
						start: 7,
						end: 11,
						local: {
							type: 'Identifier',
							start: 7,
							end: 11,
							name: 'data'
						}
					}
				],
				source: {
					type: 'Literal',
					start: 17,
					end: 28,
					value: './data.js',
					raw: "'./data.js'"
				},
				attributes: [
					{
						type: 'ImportAttribute',
						start: 36,
						end: 48,
						key: {
							type: 'Identifier',
							start: 36,
							end: 40,
							name: 'type'
						},
						value: {
							type: 'Literal',
							start: 42,
							end: 48,
							value: 'json',
							raw: "'json'"
						}
					}
				]
			},
			{
				type: 'ExportDefaultDeclaration',
				start: 52,
				end: 72,
				declaration: {
					type: 'Identifier',
					start: 67,
					end: 71,
					name: 'data'
				}
			}
		],
		sourceType: 'module'
	}
});
