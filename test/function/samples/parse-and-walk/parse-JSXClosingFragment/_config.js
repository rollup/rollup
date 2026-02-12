const assert = require('node:assert/strict');

const indexSXClosingFragments = [];

module.exports = defineTest({
	description: 'parses a JSXClosingFragment',
	options: {
		plugins: [
			{
				name: 'test-plugin',
				async transform(code) {
					await this.parseAndWalk(
						code,
						{
							JSXClosingFragment(node) {
								indexSXClosingFragments.push(node);
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
		assert.strictEqual(indexSXClosingFragments.length, 1);
		assert.strictEqual(indexSXClosingFragments[0].type, 'JSXClosingFragment');
	}
});
