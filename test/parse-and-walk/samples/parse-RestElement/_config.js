const assert = require('node:assert/strict');

const restElements = [];

module.exports = defineTest({
	description: 'parses a RestElement',
	walk: {
		RestElement(node) {
			restElements.push(node);
		}
	},
	assertions() {
		assert.deepEqual(restElements, [
			{
				type: 'RestElement',
				start: 7,
				end: 14,
				argument: {
					type: 'Identifier',
					start: 10,
					end: 14,
					name: 'rest'
				}
			}
		]);
	},
	expectedAst: {
		type: 'Program',
		start: 0,
		end: 44,
		body: [
			{
				type: 'VariableDeclaration',
				start: 0,
				end: 22,
				kind: 'const',
				declarations: [
					{
						type: 'VariableDeclarator',
						start: 6,
						end: 21,
						id: {
							type: 'ArrayPattern',
							start: 6,
							end: 15,
							elements: [
								{
									type: 'RestElement',
									start: 7,
									end: 14,
									argument: {
										type: 'Identifier',
										start: 10,
										end: 14,
										name: 'rest'
									}
								}
							]
						},
						init: {
							type: 'ArrayExpression',
							start: 18,
							end: 21,
							elements: [
								{
									type: 'Literal',
									start: 19,
									end: 20,
									raw: '1',
									value: 1
								}
							]
						}
					}
				]
			},
			{
				type: 'ExportDefaultDeclaration',
				start: 23,
				end: 43,
				declaration: {
					type: 'Identifier',
					start: 38,
					end: 42,
					name: 'rest'
				}
			}
		],
		sourceType: 'module'
	}
});
