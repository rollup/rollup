const assert = require('node:assert/strict');

const exportNamedDeclarations = [];

module.exports = defineTest({
	description: 'parses an ExportNamedDeclaration',
	options: {
		plugins: [
			{
				name: 'test-plugin',
				async transform(code) {
					await this.parseAndWalk(code, {
						ExportNamedDeclaration(node) {
							exportNamedDeclarations.push(node);
						}
					});
					return null;
				}
			}
		]
	},
	exports() {
		assert.deepEqual(exportNamedDeclarations, [
			{
				type: 'ExportNamedDeclaration',
				start: 0,
				end: 19,
				specifiers: [],
				source: null,
				attributes: [],
				declaration: {
					type: 'VariableDeclaration',
					start: 7,
					end: 19,
					kind: 'const',
					declarations: [
						{
							type: 'VariableDeclarator',
							start: 13,
							end: 18,
							id: {
								type: 'Identifier',
								start: 13,
								end: 14,
								name: 'x'
							},
							init: {
								type: 'Literal',
								start: 17,
								end: 18,
								raw: '1',
								value: 1
							}
						}
					]
				}
			}
		]);
	}
});
