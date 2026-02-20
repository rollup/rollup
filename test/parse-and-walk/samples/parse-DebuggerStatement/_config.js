const assert = require('node:assert/strict');

const debuggerStatements = [];

module.exports = defineTest({
	description: 'parses a DebuggerStatement',
	walk: {
		DebuggerStatement(node) {
			debuggerStatements.push(node);
		}
	},
	assertions() {
		assert.deepEqual(debuggerStatements, [
			{
				type: 'DebuggerStatement',
				start: 0,
				end: 9
			}
		]);
	},
	expectedAst: {
		type: 'Program',
		start: 0,
		end: 31,
		body: [
			{
				type: 'DebuggerStatement',
				start: 0,
				end: 9
			},
			{
				type: 'ExportDefaultDeclaration',
				start: 10,
				end: 30,
				declaration: {
					type: 'Literal',
					start: 25,
					end: 29,
					raw: 'null',
					value: null
				}
			}
		],
		sourceType: 'module'
	}
});
