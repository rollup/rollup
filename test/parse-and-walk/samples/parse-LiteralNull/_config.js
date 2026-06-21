const assert = require('node:assert/strict');

const literals = [];

module.exports = defineTest({
	description: 'parses a LiteralNull (as Literal)',
	walk: {
		Literal(node) {
			literals.push(node);
		}
	},
	assertions() {
		assert.deepEqual(literals, [{ type: 'Literal', start: 15, end: 19, raw: 'null', value: null }]);
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
					raw: 'null',
					value: null
				}
			}
		],
		sourceType: 'module'
	}
});
