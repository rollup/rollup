const assert = require('node:assert/strict');

const exportSpecifiers = [];

module.exports = defineTest({
	description: 'parses an ExportSpecifier',
	options: {
		plugins: [
			{
				name: 'test-plugin',
				async transform(code) {
					await this.parseAndWalk(code, {
						ExportSpecifier(node) {
							exportSpecifiers.push(node);
						}
					});
					return null;
				}
			}
		]
	},
	exports() {
		assert.deepEqual(exportSpecifiers, [
			{
				type: 'ExportSpecifier',
				start: 22,
				end: 23,
				local: {
					type: 'Identifier',
					start: 22,
					end: 23,
					name: 'x'
				},
				exported: {
					type: 'Identifier',
					start: 22,
					end: 23,
					name: 'x'
				}
			}
		]);
	}
});
