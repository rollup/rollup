const assert = require('node:assert/strict');

const methodDefinitions = [];

module.exports = defineTest({
	description: 'parses a MethodDefinition',
	walk: {
		MethodDefinition(node) {
			methodDefinitions.push(node);
		}
	},
	assertions() {
		assert.deepEqual(methodDefinitions, [
			{
				type: 'MethodDefinition',
				start: 24,
				end: 35,
				static: false,
				computed: false,
				decorators: [],
				key: {
					type: 'Identifier',
					start: 24,
					end: 30,
					name: 'method'
				},
				value: {
					type: 'FunctionExpression',
					start: 30,
					end: 35,
					async: false,
					generator: false,
					id: null,
					params: [],
					body: {
						type: 'BlockStatement',
						start: 33,
						end: 35,
						body: []
					},
					expression: false
				},
				kind: 'method'
			}
		]);
	}
});
