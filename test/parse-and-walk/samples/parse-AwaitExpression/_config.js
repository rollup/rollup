const assert = require('node:assert/strict');

const awaitExpressions = [];

module.exports = defineTest({
	description: 'parses an AwaitExpression',
	walk: {
		AwaitExpression(node) {
			awaitExpressions.push(node);
		}
	},
	assertions() {
		assert.strictEqual(awaitExpressions.length, 1);
		assert.strictEqual(awaitExpressions[0].type, 'AwaitExpression');
		assert.strictEqual(awaitExpressions[0].start, 46);
		assert.strictEqual(awaitExpressions[0].end, 70);
	},
	expectedAst: {
		type: 'Program',
		start: 0,
		end: 74,
		body: [
			{
				type: 'ExportDefaultDeclaration',
				start: 0,
				end: 73,
				declaration: {
					type: 'FunctionDeclaration',
					start: 15,
					end: 73,
					async: true,
					generator: false,
					id: {
						type: 'Identifier',
						start: 30,
						end: 33,
						name: 'foo'
					},
					params: [],
					body: {
						type: 'BlockStatement',
						start: 36,
						end: 73,
						body: [
							{
								type: 'ReturnStatement',
								start: 39,
								end: 71,
								argument: {
									type: 'AwaitExpression',
									start: 46,
									end: 70,
									argument: {
										type: 'CallExpression',
										start: 52,
										end: 70,
										optional: false,
										callee: {
											type: 'MemberExpression',
											start: 52,
											end: 67,
											computed: false,
											optional: false,
											object: {
												type: 'Identifier',
												start: 52,
												end: 59,
												name: 'Promise'
											},
											property: {
												type: 'Identifier',
												start: 60,
												end: 67,
												name: 'resolve'
											}
										},
										arguments: [
											{
												type: 'Literal',
												start: 68,
												end: 69,
												raw: '1',
												value: 1
											}
										]
									}
								}
							}
						]
					},
					expression: false
				}
			}
		],
		sourceType: 'module'
	}
});
