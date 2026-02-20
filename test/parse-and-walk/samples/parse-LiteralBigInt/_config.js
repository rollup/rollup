const assert = require('node:assert/strict');

const literals = [];

module.exports = defineTest({
	description: 'parses a LiteralBigInt (as Literal)',
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
					bigint: '123',
					raw: '123n',
					value: 123n
				}
			}
		],
		sourceType: 'module'
	}
});
