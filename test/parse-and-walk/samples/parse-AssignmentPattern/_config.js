const assert = require('node:assert/strict');

const assignmentPatterns = [];

module.exports = defineTest({
	description: 'parses an AssignmentPattern',
	walk: {
		AssignmentPattern(node) {
			assignmentPatterns.push(node);
		}
	},
	assertions() {
		assert.deepEqual(assignmentPatterns, [
			{
				type: 'AssignmentPattern',
				start: 28,
				end: 33,
				left: { type: 'Identifier', start: 28, end: 29, name: 'x' },
				right: { type: 'Literal', start: 32, end: 33, raw: '1', value: 1 }
			}
		]);
	},
	expectedAst: {
		type: 'Program',
		start: 0,
		end: 38,
		body: [
			{
				type: 'ExportDefaultDeclaration',
				start: 0,
				end: 37,
				declaration: {
					type: 'FunctionDeclaration',
					start: 15,
					end: 37,
					async: false,
					generator: false,
					id: {
						type: 'Identifier',
						start: 24,
						end: 27,
						name: 'foo'
					},
					params: [
						{
							type: 'AssignmentPattern',
							start: 28,
							end: 33,
							left: {
								type: 'Identifier',
								start: 28,
								end: 29,
								name: 'x'
							},
							right: {
								type: 'Literal',
								start: 32,
								end: 33,
								raw: '1',
								value: 1
							}
						}
					],
					body: {
						type: 'BlockStatement',
						start: 35,
						end: 37,
						body: []
					},
					expression: false
				}
			}
		],
		sourceType: 'module'
	}
});
