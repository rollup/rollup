const assert = require('node:assert/strict');

let totalDeclarations = 0;

module.exports = defineTest({
	description: 'allows to wait for children of a node to be parsed via parseAndWalk',
	options: {
		plugins: [
			{
				name: 'test-plugin',
				async transform(code) {
					let currentDeclarations = 0;
					await this.parseAndWalk(code, {
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
					});
					assert.equal(totalDeclarations, 8);
					return null;
				}
			}
		]
	},
	exports({ f1 }) {
		assert.equal(f1(), 21);
		assert.equal(totalDeclarations, 8);
	}
});
