const assert = require('node:assert/strict');

let totalDeclarations = 0;

module.exports = defineTest({
	description: 'allows to skip children of a node to be parsed via parseAndWalk',
	options: {
		plugins: [
			{
				name: 'test-plugin',
				async transform(code) {
					let currentDeclarations = 0;
					await this.parseAndWalk(code, {
						FunctionDeclaration(node, { skipChildren }) {
							const initialDeclarations = currentDeclarations;
							skipChildren();
							assert.equal(currentDeclarations, initialDeclarations);
						},
						VariableDeclarator() {
							currentDeclarations++;
							totalDeclarations++;
						}
					});
					assert.equal(totalDeclarations, 2);
					return null;
				}
			}
		]
	},
	exports({ f1 }) {
		assert.equal(f1(), 21);
		assert.equal(totalDeclarations, 2);
	}
});
