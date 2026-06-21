const assert = require('node:assert/strict');

const metaPropertys = [];

module.exports = defineTest({
	description: 'parses a MetaProperty',
	walk: {
		MetaProperty(node) {
			metaPropertys.push(node);
		}
	},
	assertions() {
		assert.deepEqual(metaPropertys, [
			{
				type: 'MetaProperty',
				start: 26,
				end: 36,
				meta: {
					type: 'Identifier',
					start: 26,
					end: 29,
					name: 'new'
				},
				property: {
					type: 'Identifier',
					start: 30,
					end: 36,
					name: 'target'
				}
			}
		]);
	},
	expectedAst: {
		type: 'Program',
		start: 0,
		end: 61,
		body: [
			{
				type: 'FunctionDeclaration',
				start: 0,
				end: 39,
				async: false,
				generator: false,
				id: {
					type: 'Identifier',
					start: 9,
					end: 13,
					name: 'test'
				},
				params: [],
				body: {
					type: 'BlockStatement',
					start: 16,
					end: 39,
					body: [
						{
							type: 'ReturnStatement',
							start: 19,
							end: 37,
							argument: {
								type: 'MetaProperty',
								start: 26,
								end: 36,
								meta: {
									type: 'Identifier',
									start: 26,
									end: 29,
									name: 'new'
								},
								property: {
									type: 'Identifier',
									start: 30,
									end: 36,
									name: 'target'
								}
							}
						}
					]
				},
				expression: false
			},
			{
				type: 'ExportDefaultDeclaration',
				start: 40,
				end: 60,
				declaration: {
					type: 'Identifier',
					start: 55,
					end: 59,
					name: 'test'
				}
			}
		],
		sourceType: 'module'
	}
});
