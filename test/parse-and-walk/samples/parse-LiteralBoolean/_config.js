const assert = require('node:assert/strict');

const literals = [];

module.exports = defineTest({
	description: 'parses a LiteralBoolean (as Literal)',
	walk: {
		Literal(node) {
			literals.push(node);
		}
	},
	assertions() {
		assert.deepEqual(literals, [{ type: 'Literal', start: 15, end: 19, raw: 'true', value: true }]);
	},
	expectedAst: {
		type: 'Program',
		start: 0,
		end: 21,
		body: [
			{
				type: 'ExportDefaultDeclaration',
				start: 0,
				end: 20,
				declaration: {
					type: 'Literal',
					start: 15,
					end: 19,
					value: true,
					raw: 'true'
				}
			}
		],
		sourceType: 'module'
	}
});
