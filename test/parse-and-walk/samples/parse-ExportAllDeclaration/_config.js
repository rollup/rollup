const { assertAstEqual } = require('../../../testHelpers.js');

const exportAllDeclarations = [];

module.exports = defineTest({
	description: 'parses an ExportAllDeclaration',
	walk: {
		ExportAllDeclaration(node) {
			exportAllDeclarations.push(node);
		}
	},
	assertions() {
		assertAstEqual(exportAllDeclarations, [
			{
				type: 'ExportAllDeclaration',
				start: 0,
				end: 25,
				exported: null,
				source: {
					type: 'Literal',
					start: 14,
					end: 24,
					value: './dep.js',
					raw: "'./dep.js'"
				},
				attributes: []
			}
		]);
	},
	expectedAst: {
		type: 'Program',
		start: 0,
		end: 26,
		body: [
			{
				type: 'ExportAllDeclaration',
				start: 0,
				end: 25,
				exported: null,
				source: {
					type: 'Literal',
					start: 14,
					end: 24,
					value: './dep.js',
					raw: "'./dep.js'"
				},
				attributes: []
			}
		],
		sourceType: 'module'
	}
});
