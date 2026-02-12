const assert = require('node:assert/strict');

const switchStatements = [];

module.exports = defineTest({
	description: 'parses a SwitchStatement',
	options: {
		plugins: [
			{
				name: 'test-plugin',
				async transform(code) {
					await this.parseAndWalk(code, {
						SwitchStatement(node) {
							switchStatements.push(node);
						}
					});
					return null;
				}
			}
		]
	},
	exports() {
		assert.strictEqual(switchStatements.length, 1);
		assert.strictEqual(switchStatements[0].type, 'SwitchStatement');
	}
});
