const assert = require('node:assert/strict');

const indexSXAttributes = [];

module.exports = defineTest({
	description: 'parses a JSXAttribute',
	options: {
		plugins: [
			{
				name: 'test-plugin',
				async transform(code) {
					await this.parseAndWalk(
						code,
						{
							JSXAttribute(node) {
								indexSXAttributes.push(node);
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
		assert.strictEqual(indexSXAttributes.length, 1);
		assert.strictEqual(indexSXAttributes[0].type, 'JSXAttribute');
	}
});
