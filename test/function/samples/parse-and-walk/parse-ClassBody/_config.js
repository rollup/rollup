const assert = require('node:assert/strict');

const classBodys = [];

module.exports = defineTest({
	description: 'parses a ClassBody',
	options: {
		plugins: [
			{
				name: 'test-plugin',
				async transform(code) {
					await this.parseAndWalk(code, {
						ClassBody(node) {
							classBodys.push(node);
						}
					});
					return null;
				}
			}
		]
	},
	exports() {
		assert.deepEqual(classBodys, [
			{
				type: 'ClassBody',
				start: 21,
				end: 37,
				body: [
					{
						type: 'MethodDefinition',
						start: 24,
						end: 35,
						static: false,
						computed: false,
						decorators: [],
						key: {
							type: 'Identifier',
							start: 24,
							end: 30,
							name: 'method'
						},
						value: {
							type: 'FunctionExpression',
							start: 30,
							end: 35,
							async: false,
							generator: false,
							id: null,
							params: [],
							body: {
								type: 'BlockStatement',
								start: 33,
								end: 35,
								body: []
							},
							expression: false
						},
						kind: 'method'
					}
				]
			}
		]);
	}
});
