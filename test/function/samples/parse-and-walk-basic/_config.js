const assert = require('node:assert/strict');

module.exports = defineTest({
	description: 'counts statements using parseAndWalk in transform hook',
	options: {
		plugins: [
			{
				name: 'test-plugin',
				async transform(code) {
					let statementCount = 0;
					await this.parseAndWalk(code, {
						Program(node) {
							statementCount = node.body.length;
						}
					});
					assert.equal(statementCount, 1);
					return null;
				}
			}
		]
	}
});
