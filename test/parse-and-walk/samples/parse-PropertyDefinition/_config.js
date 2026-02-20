const assert = require('node:assert/strict');

const propertyDefinitions = [];

module.exports = defineTest({
	description: 'parses a PropertyDefinition',
	walk: {
		PropertyDefinition(node) {
			propertyDefinitions.push(node);
		}
	},
	assertions() {
		assert.deepEqual(propertyDefinitions, [
			{
				type: 'PropertyDefinition',
				start: 24,
				end: 30,
				static: false,
				computed: false,
				decorators: [],
				key: {
					type: 'Identifier',
					start: 24,
					end: 25,
					name: 'x'
				},
				value: {
					type: 'Literal',
					start: 28,
					end: 29,
					raw: '1',
					value: 1
				}
			}
		]);
	},
	expectedAst: {
		type: 'Program',
		start: 0,
		end: 33,
		body: [
			{
				type: 'ExportDefaultDeclaration',
				start: 0,
				end: 32,
				declaration: {
					type: 'ClassDeclaration',
					start: 15,
					end: 32,
					decorators: [],
					id: null,
					superClass: null,
					body: {
						type: 'ClassBody',
						start: 21,
						end: 32,
						body: [
							{
								type: 'PropertyDefinition',
								start: 24,
								end: 30,
								static: false,
								computed: false,
								decorators: [],
								key: {
									type: 'Identifier',
									start: 24,
									end: 25,
									name: 'x'
								},
								value: {
									type: 'Literal',
									start: 28,
									end: 29,
									raw: '1',
									value: 1
								}
							}
						]
					}
				}
			}
		],
		sourceType: 'module'
	}
});
