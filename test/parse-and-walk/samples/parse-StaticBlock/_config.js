const assert = require('node:assert/strict');

const staticBlocks = [];

module.exports = defineTest({
	description: 'parses a StaticBlock',
	walk: {
		StaticBlock(node) {
			staticBlocks.push(node);
		}
	},
	assertions() {
		assert.strictEqual(staticBlocks.length, 1);
		assert.strictEqual(staticBlocks[0].type, 'StaticBlock');
	},
	expectedAst: {
		type: 'Program',
		start: 0,
		end: 57,
		body: [
			{
				type: 'ExportDefaultDeclaration',
				start: 0,
				end: 56,
				declaration: {
					type: 'ClassDeclaration',
					start: 15,
					end: 56,
					decorators: [],
					id: null,
					superClass: null,
					body: {
						type: 'ClassBody',
						start: 21,
						end: 56,
						body: [
							{
								type: 'StaticBlock',
								start: 23,
								end: 54,
								body: [
									{
										type: 'ExpressionStatement',
										start: 32,
										end: 52,
										expression: {
											type: 'CallExpression',
											start: 32,
											end: 51,
											optional: false,
											callee: {
												type: 'MemberExpression',
												start: 32,
												end: 43,
												computed: false,
												optional: false,
												object: {
													type: 'Identifier',
													start: 32,
													end: 39,
													name: 'console'
												},
												property: {
													type: 'Identifier',
													start: 40,
													end: 43,
													name: 'log'
												}
											},
											arguments: [
												{
													type: 'Literal',
													start: 44,
													end: 50,
													value: 'init',
													raw: "'init'"
												}
											]
										}
									}
								]
							}
						]
					}
				}
			}
		],
		sourceType: 'module'
	}
});
