const assert = require('node:assert/strict');

const spreadElements = [];

module.exports = defineTest({
	description: 'parses a SpreadElement',
	walk: {
		SpreadElement(node) {
			spreadElements.push(node);
		}
	},
	assertions() {
		assert.strictEqual(spreadElements.length, 1);
		assert.strictEqual(spreadElements[0].type, 'SpreadElement');
	},
	expectedAst: {
		type: 'Program',
		start: 0,
		end: 25,
		body: [
			{
				type: 'ExportDefaultDeclaration',
				start: 0,
				end: 24,
				declaration: {
					type: 'ArrayExpression',
					start: 15,
					end: 23,
					elements: [
						{
							type: 'SpreadElement',
							start: 16,
							end: 22,
							argument: {
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
