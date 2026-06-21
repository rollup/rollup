const assert = require('node:assert/strict');

let totalDeclarations = 0;

module.exports = defineTest({
	description: 'allows to skip children of a node via parseAndWalk',
	walk: {
		FunctionDeclaration(node, { skipChildren }) {
			const initialDeclarations = totalDeclarations;
			skipChildren();
			assert.equal(totalDeclarations, initialDeclarations);
		},
		VariableDeclarator() {
			totalDeclarations++;
		}
	},
	assertions() {
		assert.equal(totalDeclarations, 2);
	}
});
