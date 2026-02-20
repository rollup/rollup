const assert = require('node:assert/strict');

const indexSXOpeningFragments = [];

module.exports = defineTest({
	description: 'parses a JSXOpeningFragment',
	parseOptions: { jsx: true },
	walk: {
		JSXOpeningFragment(node) {
			indexSXOpeningFragments.push(node);
		}
	},
	assertions() {
		assert.strictEqual(indexSXOpeningFragments.length, 1);
		assert.strictEqual(indexSXOpeningFragments[0].type, 'JSXOpeningFragment');
	},
	expectedAst: {
		type: 'Program',
		start: 0,
		end: 26,
		body: [
			{
				type: 'ExportDefaultDeclaration',
				start: 0,
				end: 25,
				declaration: {
					type: 'JSXFragment',
					start: 15,
					end: 24,
					openingFragment: {
						type: 'JSXOpeningFragment',
						start: 15,
						end: 17,
						attributes: [],
						selfClosing: false
					},
					children: [
						{
							type: 'JSXText',
							start: 17,
							end: 21,
							value: 'test',
							raw: 'test'
						}
					],
					closingFragment: {
						type: 'JSXClosingFragment',
						start: 21,
						end: 24
					}
				}
			}
		],
		sourceType: 'module'
	}
});
