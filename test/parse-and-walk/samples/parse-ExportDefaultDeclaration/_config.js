const assert = require('node:assert/strict');

const exportDefaultDeclarations = [];

module.exports = defineTest({
	description: 'parses an ExportDefaultDeclaration',
	walk: {
		ExportDefaultDeclaration(node) {
			exportDefaultDeclarations.push(node);
		}
	},
	assertions() {
		assert.deepEqual(exportDefaultDeclarations, [
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
	}
});
