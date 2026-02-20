const assert = require('node:assert/strict');

const taggedTemplateExpressions = [];

module.exports = defineTest({
	description: 'parses a TaggedTemplateExpression',
	walk: {
		TaggedTemplateExpression(node) {
			taggedTemplateExpressions.push(node);
		}
	},
	assertions() {
		assert.strictEqual(taggedTemplateExpressions.length, 1);
		assert.strictEqual(taggedTemplateExpressions[0].type, 'TaggedTemplateExpression');
	},
	expectedAst: {
		type: 'Program',
		start: 0,
		end: 95,
		body: [
			{
				type: 'FunctionDeclaration',
				start: 0,
				end: 60,
				async: false,
				generator: false,
				id: {
					type: 'Identifier',
					start: 9,
					end: 12,
					name: 'tag'
				},
				params: [
					{
						type: 'Identifier',
						start: 13,
						end: 20,
						name: 'strings'
					},
					{
						type: 'Identifier',
						start: 22,
						end: 27,
						name: 'value'
					}
				],
				body: {
					type: 'BlockStatement',
					start: 29,
					end: 60,
					body: [
						{
							type: 'ReturnStatement',
							start: 32,
							end: 58,
							argument: {
								type: 'BinaryExpression',
								start: 39,
								end: 57,
								operator: '+',
								left: {
									type: 'MemberExpression',
									start: 39,
									end: 49,
									computed: true,
									optional: false,
									object: {
										type: 'Identifier',
										start: 39,
										end: 46,
										name: 'strings'
									},
									property: {
										type: 'Literal',
										start: 47,
										end: 48,
										raw: '0',
										value: 0
									}
								},
								right: {
									type: 'Identifier',
									start: 52,
									end: 57,
									name: 'value'
								}
							}
						}
					]
				},
				expression: false
			},
			{
				type: 'ExportDefaultDeclaration',
				start: 61,
				end: 94,
				declaration: {
					type: 'TaggedTemplateExpression',
					start: 76,
					end: 93,
					tag: {
						type: 'Identifier',
						start: 76,
						end: 79,
						name: 'tag'
					},
					quasi: {
						type: 'TemplateLiteral',
						start: 79,
						end: 93,
						quasis: [
							{
								type: 'TemplateElement',
								start: 80,
								end: 87,
								tail: false,
								value: {
									cooked: 'value: ',
									raw: 'value: '
								}
							},
							{
								type: 'TemplateElement',
								start: 92,
								end: 92,
								tail: true,
								value: {
									cooked: '',
									raw: ''
								}
							}
						],
						expressions: [
							{
								type: 'Literal',
								start: 89,
								end: 91,
								raw: '42',
								value: 42
							}
						]
					}
				}
			}
		],
		sourceType: 'module'
	}
});
