const assert = require('node:assert/strict');

const privateIdentifiers = [];

module.exports = defineTest({
	description: 'parses a PrivateIdentifier',
	walk: {
		PrivateIdentifier(node) {
			privateIdentifiers.push(node);
		}
	},
	assertions() {
		assert.deepEqual(privateIdentifiers, [
			{
				type: 'PrivateIdentifier',
				start: 24,
				end: 37,
				name: 'privateField'
			},
			{
				type: 'PrivateIdentifier',
				start: 69,
				end: 82,
				name: 'privateField'
			}
		]);
	},
	expectedAst: {
		type: 'Program',
		start: 0,
		end: 89,
		body: [
			{
				type: 'ExportDefaultDeclaration',
				start: 0,
				end: 88,
				declaration: {
					type: 'ClassDeclaration',
					start: 15,
					end: 88,
					decorators: [],
					id: null,
					superClass: null,
					body: {
						type: 'ClassBody',
						start: 21,
						end: 88,
						body: [
							{
								type: 'PropertyDefinition',
								start: 24,
								end: 42,
								static: false,
								computed: false,
								decorators: [],
								key: {
									type: 'PrivateIdentifier',
									start: 24,
									end: 37,
									name: 'privateField'
								},
								value: {
									type: 'Literal',
									start: 40,
									end: 41,
									raw: '1',
									value: 1
								}
							},
							{
								type: 'MethodDefinition',
								start: 44,
								end: 86,
								static: false,
								computed: false,
								decorators: [],
								key: {
									type: 'Identifier',
									start: 44,
									end: 50,
									name: 'method'
								},
								value: {
									type: 'FunctionExpression',
									start: 50,
									end: 86,
									async: false,
									generator: false,
									id: null,
									params: [],
									body: {
										type: 'BlockStatement',
										start: 53,
										end: 86,
										body: [
											{
												type: 'ReturnStatement',
												start: 57,
												end: 83,
												argument: {
													type: 'MemberExpression',
													start: 64,
													end: 82,
													computed: false,
													optional: false,
													object: {
														type: 'ThisExpression',
														start: 64,
														end: 68
													},
													property: {
														type: 'PrivateIdentifier',
														start: 69,
														end: 82,
														name: 'privateField'
													}
												}
											}
										]
									},
									expression: false
								},
								kind: 'method'
							}
						]
					}
				}
			}
		],
		sourceType: 'module'
	}
});
