const assert = require('node:assert/strict');

const indexSXNamespacedNames = [];

module.exports = defineTest({
	description: 'parses a JSXNamespacedName',
	options: {
		plugins: [
			{
				name: 'test-plugin',
				async transform(code) {
					await this.parseAndWalk(
						code,
						{
							JSXNamespacedName(node) {
								indexSXNamespacedNames.push(node);
							}
						},
						{ jsx: true }
					);
					return 'export default null;';
				}
			}
		]
	},
	exports() {
		assert.ok(indexSXNamespacedNames.length >= 2);
		assert.strictEqual(indexSXNamespacedNames[0].type, 'JSXNamespacedName');
	}
});
