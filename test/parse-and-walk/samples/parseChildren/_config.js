const assert = require('node:assert/strict');

let totalDeclarations = 0;
let currentDeclarations = 0;

module.exports = defineTest({
	description: 'allows to wait for children of a node to be parsed via parseAndWalk',
	walk: {
		FunctionDeclaration(node, { parseChildren }) {
			const initialDeclarations = currentDeclarations;
			parseChildren();
			assert.equal(currentDeclarations, initialDeclarations + 2);
			currentDeclarations = initialDeclarations;
		},
		VariableDeclarator() {
			currentDeclarations++;
			totalDeclarations++;
		}
	},
	assertions() {
		assert.equal(totalDeclarations, 8);
	}
});
