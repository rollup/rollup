const assert = require('node:assert/strict');

const indexSXIdentifiers = [];

module.exports = defineTest({
	description: 'parses a JSXIdentifier',
	options: {
		plugins: [
			{
				name: 'test-plugin',
				async transform(code) {
					await this.parseAndWalk(
						code,
						{
							JSXIdentifier(node) {
								indexSXIdentifiers.push(node);
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
		assert.ok(indexSXIdentifiers.length >= 2);
		assert.strictEqual(indexSXIdentifiers[0].type, 'JSXIdentifier');
	}
});
