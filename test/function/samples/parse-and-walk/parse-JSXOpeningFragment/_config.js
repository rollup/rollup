const assert = require('node:assert/strict');

const indexSXOpeningFragments = [];

module.exports = defineTest({
	description: 'parses a JSXOpeningFragment',
	options: {
		plugins: [
			{
				name: 'test-plugin',
				async transform(code) {
					await this.parseAndWalk(
						code,
						{
							JSXOpeningFragment(node) {
								indexSXOpeningFragments.push(node);
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
		assert.strictEqual(indexSXOpeningFragments.length, 1);
		assert.strictEqual(indexSXOpeningFragments[0].type, 'JSXOpeningFragment');
	}
});
