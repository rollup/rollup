const assert = require('node:assert/strict');

const objectPatterns = [];

module.exports = defineTest({
	description: 'parses an ObjectPattern',
	walk: {
		ObjectPattern(node) {
			objectPatterns.push(node);
		}
	},
	assertions() {
		assert.deepEqual(objectPatterns, [
			{
				type: 'ObjectPattern',
				start: 6,
				end: 11,
				properties: [
					{
						type: 'Property',
						start: 8,
						end: 9,
						method: false,
						shorthand: true,
						computed: false,
						key: {
							type: 'Identifier',
							start: 8,
							end: 9,
							name: 'x'
						},
						value: {
							type: 'Identifier',
							start: 8,
							end: 9,
							name: 'x'
						},
						kind: 'init'
					}
				]
			}
		]);
	},
	expectedAst: {
		type: 'Program',
		start: 0,
		end: 42,
		body: [
			{
				type: 'VariableDeclaration',
				start: 0,
				end: 23,
				kind: 'const',
				declarations: [
					{
						type: 'VariableDeclarator',
						start: 6,
						end: 22,
						id: {
							type: 'ObjectPattern',
							start: 6,
							end: 11,
							properties: [
								{
									type: 'Property',
									start: 8,
									end: 9,
									method: false,
									shorthand: true,
									computed: false,
									key: {
										type: 'Identifier',
										start: 8,
										end: 9,
										name: 'x'
									},
									value: {
										type: 'Identifier',
										start: 8,
										end: 9,
										name: 'x'
									},
									kind: 'init'
								}
							]
						},
						init: {
							type: 'ObjectExpression',
							start: 14,
							end: 22,
							properties: [
								{
									type: 'Property',
									start: 16,
									end: 20,
									method: false,
									shorthand: false,
									computed: false,
									key: {
										type: 'Identifier',
										start: 16,
										end: 17,
										name: 'x'
									},
									value: {
										type: 'Literal',
										start: 19,
										end: 20,
										raw: '1',
										value: 1
									},
									kind: 'init'
								}
							]
						}
					}
				]
			},
			{
				type: 'ExportDefaultDeclaration',
				start: 24,
				end: 41,
				declaration: {
					type: 'Identifier',
					start: 39,
					end: 40,
					name: 'x'
				}
			}
		],
		sourceType: 'module'
	}
});
