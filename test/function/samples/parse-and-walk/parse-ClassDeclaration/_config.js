const assert = require('node:assert/strict');

const classDeclarations = [];

module.exports = defineTest({
	description: 'parses a ClassDeclaration',
	options: {
		plugins: [
			{
				name: 'test-plugin',
				async transform(code) {
					await this.parseAndWalk(code, {
						ClassDeclaration(node) {
							classDeclarations.push(node);
						}
					});
					return null;
				}
			}
		]
	},
	exports() {
		assert.deepEqual(classDeclarations, [
			{
				type: 'ClassDeclaration',
				start: 15,
				end: 27,
				decorators: [],
				id: {
					type: 'Identifier',
					start: 21,
					end: 24,
					name: 'Foo'
				},
				superClass: null,
				body: {
					type: 'ClassBody',
					start: 25,
					end: 27,
					body: []
				}
			}
		]);
	}
});
