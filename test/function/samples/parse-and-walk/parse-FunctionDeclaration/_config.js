const assert = require('node:assert/strict');

const functionDeclarations = [];

module.exports = defineTest({
	description: 'parses a FunctionDeclaration',
	options: {
		plugins: [
			{
				name: 'test-plugin',
				async transform(code) {
					await this.parseAndWalk(code, {
						FunctionDeclaration(node) {
							functionDeclarations.push(node);
						}
					});
					return null;
				}
			}
		]
	},
	exports() {
		assert.deepEqual(functionDeclarations, [
			{
				type: 'FunctionDeclaration',
				start: 0,
				end: 17,
				async: false,
				generator: false,
				id: {
					type: 'Identifier',
					start: 9,
					end: 12,
					name: 'foo'
				},
				params: [],
				body: {
					type: 'BlockStatement',
					start: 15,
					end: 17,
					body: []
				},
				expression: false
			}
		]);
	}
});
