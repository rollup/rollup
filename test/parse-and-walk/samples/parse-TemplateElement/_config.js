const assert = require('node:assert/strict');

const templateElements = [];

module.exports = defineTest({
	description: 'parses a TemplateElement',
	walk: {
		TemplateElement(node) {
			templateElements.push(node);
		}
	},
	assertions() {
		assert.ok(templateElements.length >= 1);
		assert.strictEqual(templateElements[0].type, 'TemplateElement');
	},
	expectedAst: {
		type: 'Program',
		start: 0,
		end: 31,
		body: [
			{
				type: 'ExportDefaultDeclaration',
				start: 0,
				end: 30,
				declaration: {
					type: 'TemplateLiteral',
					start: 15,
					end: 29,
					quasis: [
						{
							type: 'TemplateElement',
							start: 16,
							end: 23,
							tail: false,
							value: {
								cooked: 'value: ',
								raw: 'value: '
							}
						},
						{
							type: 'TemplateElement',
							start: 28,
							end: 28,
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
							start: 25,
							end: 27,
							raw: '42',
							value: 42
						}
					]
				}
			}
		],
		sourceType: 'module'
	}
});
