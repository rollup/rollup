const assert = require('node:assert/strict');

const forOfStatements = [];

module.exports = defineTest({
	description: 'parses a ForOfStatement',
	options: {
		plugins: [
			{
				name: 'test-plugin',
				async transform(code) {
					await this.parseAndWalk(code, {
						ForOfStatement(node) {
							forOfStatements.push(node);
						}
					});
					return null;
				}
			}
		]
	},
	exports() {
		assert.deepEqual(forOfStatements, [
			{
				type: 'ForOfStatement',
				start: 17,
				end: 62,
				await: false,
				left: {
					type: 'VariableDeclaration',
					start: 22,
					end: 31,
					kind: 'const',
					declarations: [
						{
							type: 'VariableDeclarator',
							start: 28,
							end: 31,
							id: {
								type: 'Identifier',
								start: 28,
								end: 31,
								name: 'val'
							},
							init: null
						}
					]
				},
				right: {
					type: 'Identifier',
					start: 35,
					end: 38,
					name: 'arr'
				},
				body: {
					type: 'BlockStatement',
					start: 40,
					end: 62,
					body: [
						{
							type: 'ExpressionStatement',
							start: 43,
							end: 60,
							expression: {
								type: 'CallExpression',
								start: 43,
								end: 59,
								optional: false,
								callee: {
									type: 'MemberExpression',
									start: 43,
									end: 54,
									computed: false,
									optional: false,
									object: {
										type: 'Identifier',
										start: 43,
										end: 50,
										name: 'console'
									},
									property: {
										type: 'Identifier',
										start: 51,
										end: 54,
										name: 'log'
									}
								},
								arguments: [
									{
										type: 'Identifier',
										start: 55,
										end: 58,
										name: 'val'
									}
								]
							}
						}
					]
				}
			}
		]);
	}
});
