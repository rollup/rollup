const assert = require('node:assert/strict');

const indexSXFragments = [];

module.exports = defineTest({
	description: 'parses a JSXFragment',
	parseOptions: { jsx: true },
	walk: {
		JSXFragment(node) {
			indexSXFragments.push(node);
		}
	},
	assertions() {
		assert.strictEqual(indexSXFragments.length, 1);
		assert.strictEqual(indexSXFragments[0].type, 'JSXFragment');
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
