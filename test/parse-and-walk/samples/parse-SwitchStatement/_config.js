const assert = require('node:assert/strict');

const switchStatements = [];

module.exports = defineTest({
	description: 'parses a SwitchStatement',
	walk: {
		SwitchStatement(node) {
			switchStatements.push(node);
		}
	},
	assertions() {
		assert.strictEqual(switchStatements.length, 1);
		assert.strictEqual(switchStatements[0].type, 'SwitchStatement');
	},
	expectedAst: {
		type: 'Program',
		start: 0,
		end: 80,
		body: [
			{
				type: 'ExportDefaultDeclaration',
				start: 0,
				end: 79,
				declaration: {
					type: 'FunctionDeclaration',
					start: 15,
					end: 79,
					async: false,
					generator: false,
					id: {
						type: 'Identifier',
						start: 24,
						end: 28,
						name: 'test'
					},
					params: [
						{
							type: 'Identifier',
							start: 29,
							end: 30,
							name: 'x'
						}
					],
					body: {
						type: 'BlockStatement',
						start: 32,
						end: 79,
						body: [
							{
								type: 'SwitchStatement',
								start: 35,
								end: 77,
								discriminant: {
									type: 'Identifier',
									start: 43,
									end: 44,
									name: 'x'
								},
								cases: [
									{
										type: 'SwitchCase',
										start: 50,
										end: 74,
										test: {
											type: 'Literal',
											start: 55,
											end: 56,
											raw: '1',
											value: 1
										},
										consequent: [
											{
												type: 'ReturnStatement',
												start: 61,
												end: 74,
												argument: {
													type: 'Literal',
													start: 68,
													end: 73,
													value: 'one',
													raw: "'one'"
												}
											}
										]
									}
								]
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
