const assert = require('node:assert/strict');

const literals = [];

module.exports = defineTest({
	description: 'parses a LiteralString (as Literal)',
	walk: {
		Literal(node) {
			literals.push(node);
		}
	},
	assertions() {
		assert.deepEqual(literals, [
			{ type: 'Literal', start: 15, end: 21, value: 'test', raw: "'test'" }
		]);
	},
	expectedAst: {
		type: 'Program',
		start: 0,
		end: 23,
		body: [
			{
				type: 'ExportDefaultDeclaration',
				start: 0,
				end: 22,
				declaration: {
					type: 'Literal',
					start: 15,
					end: 21,
					value: 'test',
					raw: "'test'"
				}
			}
		],
		sourceType: 'module'
	}
});
