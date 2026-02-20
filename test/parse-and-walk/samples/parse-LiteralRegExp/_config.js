const assert = require('node:assert/strict');

const literals = [];

module.exports = defineTest({
	description: 'parses a LiteralRegExp (as Literal)',
	walk: {
		Literal(node) {
			literals.push(node);
		}
	},
	assertions() {
		assert.strictEqual(literals.length, 1);
		assert.strictEqual(literals[0].type, 'Literal');
	},
	expectedAst: {
		type: 'Program',
		start: 0,
		end: 24,
		body: [
			{
				type: 'ExportDefaultDeclaration',
				start: 0,
				end: 23,
				declaration: {
					type: 'Literal',
					start: 15,
					end: 22,
					raw: '/test/g',
					regex: {
						flags: 'g',
						pattern: 'test'
					},
					value: /test/g
				}
			}
		],
		sourceType: 'module'
	}
});
