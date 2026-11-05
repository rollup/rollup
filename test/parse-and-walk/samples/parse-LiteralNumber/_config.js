const { assertAstEqual } = require('../../../testHelpers.js');

const literals = [];

module.exports = defineTest({
	description: 'parses a LiteralNumber (as Literal)',
	walk: {
		Literal(node) {
			literals.push(node);
		}
	},
	assertions() {
		assertAstEqual(literals, [{ type: 'Literal', start: 15, end: 17, raw: '42', value: 42 }]);
	},
	expectedAst: {
		type: 'Program',
		start: 0,
		end: 19,
		body: [
			{
				type: 'ExportDefaultDeclaration',
				start: 0,
				end: 18,
				declaration: {
					type: 'Literal',
					start: 15,
					end: 17,
					raw: '42',
					value: 42
				}
			}
		],
		sourceType: 'module'
	}
});
