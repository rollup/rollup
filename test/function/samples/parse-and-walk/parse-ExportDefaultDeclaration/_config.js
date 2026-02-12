const assert = require('node:assert/strict');

const exportDefaultDeclarations = [];

module.exports = defineTest({
	description: 'parses an ExportDefaultDeclaration',
	options: {
		plugins: [
			{
				name: 'test-plugin',
				async transform(code) {
					await this.parseAndWalk(code, {
						ExportDefaultDeclaration(node) {
							exportDefaultDeclarations.push(node);
						}
					});
					return null;
				}
			}
		]
	},
	exports() {
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
