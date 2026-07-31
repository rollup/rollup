const assert = require('node:assert/strict');

const supers = [];

module.exports = defineTest({
	description: 'parses a Super',
	walk: {
		Super(node) {
			supers.push(node);
		}
	},
	assertions() {
		assert.strictEqual(supers.length, 1);
		assert.strictEqual(supers[0].type, 'Super');
	},
	expectedAst: {
		type: 'Program',
		start: 0,
		end: 66,
		body: [
			{
				type: 'ExportDefaultDeclaration',
				start: 0,
				end: 65,
				declaration: {
					type: 'ClassDeclaration',
					start: 15,
					end: 65,
					decorators: [],
					id: null,
					superClass: {
						type: 'Identifier',
						start: 29,
						end: 34,
						name: 'Array'
					},
					body: {
						type: 'ClassBody',
						start: 35,
						end: 65,
						body: [
							{
								type: 'MethodDefinition',
								start: 37,
								end: 63,
								static: false,
								computed: false,
								decorators: [],
								key: {
									type: 'Identifier',
									start: 37,
									end: 48,
									name: 'constructor'
								},
								value: {
									type: 'FunctionExpression',
									start: 48,
									end: 63,
									async: false,
									generator: false,
									id: null,
									params: [],
									body: {
										type: 'BlockStatement',
										start: 51,
										end: 63,
										body: [
											{
												type: 'ExpressionStatement',
												start: 53,
												end: 61,
												expression: {
													type: 'CallExpression',
													start: 53,
													end: 60,
													optional: false,
													callee: {
														type: 'Super',
														start: 53,
														end: 58
													},
													arguments: []
												}
											}
										]
									},
									expression: false
								},
								kind: 'constructor'
							}
						]
					}
				}
			}
		],
		sourceType: 'module'
	}
});
