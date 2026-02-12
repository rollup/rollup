const assert = require('node:assert/strict');

const objectExpressions = [];

module.exports = defineTest({
	description: 'parses an ObjectExpression',
	options: {
		plugins: [
			{
				name: 'test-plugin',
				async transform(code) {
					await this.parseAndWalk(code, {
						ObjectExpression(node) {
							objectExpressions.push(node);
						}
					});
					return null;
				}
			}
		]
	},
	exports() {
		assert.deepEqual(objectExpressions, [
			{
				type: 'ObjectExpression',
				start: 15,
				end: 23,
				properties: [
					{
						type: 'Property',
						start: 17,
						end: 21,
						method: false,
						shorthand: false,
						computed: false,
						key: {
							type: 'Identifier',
							start: 17,
							end: 18,
							name: 'x'
						},
						value: {
							type: 'Literal',
							start: 20,
							end: 21,
							raw: '1',
							value: 1
						},
						kind: 'init'
					}
				]
			}
		]);
	}
});
