const { assertAstEqual } = require('../../../testHelpers.js');

const exportDefaultDeclarations = [];

module.exports = defineTest({
	description: 'parses an ExportDefaultDeclaration',
	walk: {
		ExportDefaultDeclaration(node) {
			exportDefaultDeclarations.push(node);
		}
	},
	assertions() {
		assertAstEqual(exportDefaultDeclarations, [
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
		]);
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
