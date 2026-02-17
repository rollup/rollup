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
	}
});
