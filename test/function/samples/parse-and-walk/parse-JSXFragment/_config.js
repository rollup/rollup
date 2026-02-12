const assert = require('node:assert/strict');

const indexSXFragments = [];

module.exports = defineTest({
	description: 'parses a JSXFragment',
	options: {
		plugins: [
			{
				name: 'test-plugin',
				async transform(code) {
					await this.parseAndWalk(
						code,
						{
							JSXFragment(node) {
								indexSXFragments.push(node);
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
		assert.strictEqual(indexSXFragments.length, 1);
		assert.strictEqual(indexSXFragments[0].type, 'JSXFragment');
	}
});
