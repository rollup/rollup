const assert = require('node:assert/strict');

const labeledStatements = [];

module.exports = defineTest({
	description: 'parses a LabeledStatement',
	options: {
		plugins: [
			{
				name: 'test-plugin',
				async transform(code) {
					await this.parseAndWalk(code, {
						LabeledStatement(node) {
							labeledStatements.push(node);
						}
					});
					return null;
				}
			}
		]
	},
	exports() {
		assert.deepEqual(labeledStatements, [
			{
				type: 'LabeledStatement',
				start: 0,
				end: 29,
				label: {
					type: 'Identifier',
					start: 0,
					end: 7,
					name: 'myLabel'
				},
				body: {
					type: 'ExpressionStatement',
					start: 9,
					end: 29,
					expression: {
						type: 'CallExpression',
						start: 9,
						end: 28,
						optional: false,
						callee: {
							type: 'MemberExpression',
							start: 9,
							end: 20,
							computed: false,
							optional: false,
							object: {
								type: 'Identifier',
								start: 9,
								end: 16,
								name: 'console'
							},
							property: {
								type: 'Identifier',
								start: 17,
								end: 20,
								name: 'log'
							}
						},
						arguments: [
							{
								type: 'Literal',
								start: 21,
								end: 27,
								value: 'test',
								raw: "'test'"
							}
						]
					}
				}
			}
		]);
	}
});
