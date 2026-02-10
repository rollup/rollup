const assert = require('node:assert/strict');

module.exports = defineTest({
	description: 'counts statements using parseAndWalk in transform hook',
	options: {
		plugins: [
			{
				name: 'test-plugin',
				async transform(code) {
					let bodyStatementCount = 0;
					const variableDeclarators = [];
					await this.parseAndWalk(code, {
						Program(node) {
							bodyStatementCount = node.body.length;
						},
						VariableDeclarator(node) {
							variableDeclarators.push(node.id.name);
						}
					});
					assert.equal(bodyStatementCount, 2, 'bodyStatementCount');
					assert.deepEqual(variableDeclarators, ['value', 'nested'], 'variableDeclarators');
					return null;
				}
			}
		]
	}
});
