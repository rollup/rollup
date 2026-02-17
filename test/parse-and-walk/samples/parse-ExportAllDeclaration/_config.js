const assert = require('node:assert/strict');

const exportAllDeclarations = [];

module.exports = defineTest({
	description: 'parses an ExportAllDeclaration',
	walk: {
		ExportAllDeclaration(node) {
			exportAllDeclarations.push(node);
		}
	},
	assertions() {
		assert.deepEqual(exportAllDeclarations, [
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
	}
});
