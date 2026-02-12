const assert = require('node:assert/strict');

const exportAllDeclarations = [];

module.exports = defineTest({
	description: 'parses an ExportAllDeclaration',
	options: {
		plugins: [
			{
				name: 'test-plugin',
				async transform(code) {
					await this.parseAndWalk(code, {
						ExportAllDeclaration(node) {
							exportAllDeclarations.push(node);
						}
					});
					return null;
				}
			}
		]
	},
	exports() {
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
