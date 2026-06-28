const assert = require('node:assert/strict');

const arrayPatterns = [];

module.exports = defineTest({
	description: 'parses an ArrayPattern',
	walk: {
		ArrayPattern(node) {
			arrayPatterns.push(node);
		}
	},
	assertions() {
		assert.deepEqual(arrayPatterns, [
			{
				type: 'ArrayPattern',
				start: 13,
				end: 16,
				elements: [{ type: 'Identifier', start: 14, end: 15, name: 'a' }]
			}
		]);
	},
	expectedAst: {
		type: 'Program',
		start: 0,
		end: 24,
		body: [
			{
				type: 'ExportNamedDeclaration',
				start: 0,
				end: 23,
				specifiers: [],
				source: null,
				attributes: [],
				declaration: {
					type: 'VariableDeclaration',
					start: 7,
					end: 23,
					kind: 'const',
					declarations: [
						{
							type: 'VariableDeclarator',
							start: 13,
							end: 22,
							id: {
								type: 'ArrayPattern',
								start: 13,
								end: 16,
								elements: [
									{
										type: 'Identifier',
										start: 14,
										end: 15,
										name: 'a'
									}
								]
							},
							init: {
								type: 'ArrayExpression',
								start: 19,
								end: 22,
								elements: [
									{
										type: 'Literal',
										start: 20,
										end: 21,
										raw: '1',
										value: 1
									}
								]
							}
						}
					]
				}
			}
		],
		sourceType: 'module'
	}
});
